import { CodeGenerator } from '@babel/generator';
import { type ParseResult, parseExpression } from '@babel/parser';
import type { NodePath } from '@babel/traverse';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { SheetEntry } from '@native-twin/css';
import { type CompilerContext, SheetEntryHandler } from '@native-twin/css/jsx';
import * as Tree from '@native-twin/helpers/tree';
import * as RA from 'effect/Array';
import * as Chunk from 'effect/Chunk';
import * as Context from 'effect/Context';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import * as Transforms from '../internal/TwinTransforms.js';
import type { CompilerStyleSheet } from '../models/CompilerSheet.js';
import { JSXElementSheet } from '../models/CompilerStyleSheet.js';
import type { TwinJSXElement } from '../models/JSXElement.model.js';
import type { NativeTwinPluginConfiguration } from '../shared/compiler.constants.js';
import {
  addJsxExpressionAttribute,
  getBabelBindingImportSource,
} from '../utils/babel/babel.utils.js';
import { TwinNodeContext, TwinNodeContextLive } from './TwinNodeContext.service.js';

export interface JSXElementTree<T> {
  readonly value: T;
  readonly index: number;
  readonly childs: JSXElementTree<T>[];
}

export type TwinExtractedPath = Data.TaggedEnum<{
  JSXElement: NodePath<t.JSXElement>;
}>;

export const TwinExtractedPath = Data.taggedEnum<TwinExtractedPath>();

const make = Effect.gen(function* () {
  const { getTwForPlatform } = yield* TwinNodeContext;

  return {
    extractJSXElementTrees,
    extractJSXRootElements,
    resolveJSXBinding,
    resolveJSXElementTree,
    jsxElementTreeToSheets: (tree: Tree.Tree<TwinJSXElement>, platform: string) =>
      Effect.map(getTwForPlatform(platform), (sheet) =>
        Tree.mapTree<TwinJSXElement, JSXElementSheet>(tree, ({ value }, parent) =>
          compileTwinElement(value, sheet, parent?.value),
        ),
      ),
    transformAstWithSheets,
  };
});

/** CONTEXT */

export interface BabelCompilerContext extends Effect.Effect.Success<typeof make> {}
export const BabelCompilerContext = Context.GenericTag<BabelCompilerContext>(
  'babel/common/compiler',
);

export const BabelCompilerContextLive = Layer.effect(BabelCompilerContext, make).pipe(
  Layer.provide(TwinNodeContextLive),
);

const resolveJSXBinding = (ast: NodePath<t.JSXElement>) =>
  Option.Do.pipe(
    Option.bind('elementName', () =>
      Option.liftPredicate(ast.node.openingElement.name, (x) => t.isJSXIdentifier(x)),
    ),
    Option.bind('binding', ({ elementName }) =>
      Option.fromNullable(ast.scope.getBinding(elementName.name)),
    ),
    Option.bind('importSource', ({ binding }) => getBabelBindingImportSource(binding)),
  );

const transformAstWithSheets = (
  ast: ParseResult<t.File>,
  sheets: Iterable<JSXElementSheet>,
) => {
  const twinAstInject: ParseResult<t.Expression>[] = [];
  for (const twinSheet of sheets) {
    const { jsxTwinProp, injectString } = twinSheet.toCode();
    const twinInjectAst = parseExpression(injectString, {
      sourceType: 'script',
      errorRecovery: true,
    });
    const twinJsxAst = parseExpression(jsxTwinProp, {
      sourceType: 'script',
      errorRecovery: true,
    });
    if (twinInjectAst) {
      const propNames = RA.map(twinSheet.props, (x) => x.prop);
      for (const attr of twinSheet.element.ast.get('openingElement').get('attributes')) {
        if (!attr.isJSXAttribute()) continue;
        const name = attr.get('name');
        if (!name.isJSXIdentifier()) continue;
        if (!RA.contains(propNames, name.node.name)) continue;
        attr.remove();
      }
      const props = twinSheet.toObject();
      twinAstInject.push(twinInjectAst);
      addJsxExpressionAttribute(twinSheet.element.ast.node, '_twinInjected', twinJsxAst);
      addJsxExpressionAttribute(
        twinSheet.element.ast.node,
        '_twinElementID',
        t.stringLiteral(props.id),
      );
      if (twinSheet.parentSheet) {
        addJsxExpressionAttribute(
          twinSheet.element.ast.node,
          '_twinElementParentID',
          t.stringLiteral(props.parentID),
        );
      }
      addJsxExpressionAttribute(
        twinSheet.element.ast.node,
        '_twinElementOrder',
        t.numericLiteral(props.index),
      );
    }
  }

  ast.program.body.push(
    t.expressionStatement(
      t.callExpression(
        t.memberExpression(t.identifier('__Twin___StyleSheet'), t.identifier('inject')),
        [t.arrayExpression(twinAstInject)],
      ),
    ),
  );
  return new CodeGenerator(ast).generate().code;
};

const compileTwinElement = (
  element: TwinJSXElement,
  sheet: CompilerStyleSheet,
  parentSheet?: JSXElementSheet,
) => {
  const compiledProps = element.mappedProps.map((prop) => {
    const { childEntries, entries } = mapTwinEntriesToSheetHandler(
      sheet.twinFn(prop.value.text),
      sheet.ctx,
    );
    return {
      ...prop,
      entries,
      childEntries,
    };
  });
  return new JSXElementSheet(element, compiledProps, parentSheet);
};

const mapTwinEntriesToSheetHandler = (entries: SheetEntry[], ctx: CompilerContext) => {
  const handlers = RA.partition(
    entries.map((x) => new SheetEntryHandler(x, ctx)),
    (x) => x.isChildEntry(),
  );
  return {
    entries: handlers[0],
    childEntries: handlers[1],
  };
};

export const extractJSXRootElements = (ast: ParseResult<t.File>) => {
  return Stream.async<NodePath<t.JSXElement>>((emit) => {
    traverse(
      ast,
      Transforms.TwinVisitors.createBabelVisitors(
        Transforms.TwinVisitors.AddRootJSXElementPathToState,
        {
          Program: {
            exit() {
              emit.chunk(Chunk.fromIterable(this.extracted)).then(() => emit.end());
            },
          },
        },
      ),
      undefined,
      {
        extracted: [],
        dependencies: [],
      },
    );
  });
};

const resolveJSXElementTree = (
  element: NodePath<t.JSXElement>,
): Tree.Tree<NodePath<t.JSXElement>> => {
  const tree = new Tree.Tree(element);
  getJSXElementChilds(tree.root);

  return tree;
  function getJSXElementChilds(parent: Tree.TreeNode<NodePath<t.JSXElement>>) {
    for (const child of parent.value.get('children').filter((x) => x.isJSXElement())) {
      const childLeave = parent.addChild(child, parent);
      getJSXElementChilds(childLeave);
    }
  }
};

const extractJSXElementTrees = (
  ast: ParseResult<t.File>,
  config: NativeTwinPluginConfiguration,
) =>
  Stream.async<NodePath<t.JSXElement>>((emit) => {
    traverse(
      ast,
      Transforms.TwinVisitors.createBabelVisitors(
        Transforms.TwinVisitors.AddRootJSXElementPathToState,
        Transforms.TwinVisitors.AddStyleSheetImportVisitor,
        {
          Program: {
            exit() {
              emit.chunk(Chunk.fromIterable(this.extracted)).then(() => emit.end());
            },
          },
        },
      ),
      undefined,
      {
        extracted: [],
        config,
        dependencies: [],
      },
    );
  }).pipe(Stream.map((x) => Transforms.getJSXElementTree(x)));
