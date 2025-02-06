import { CodeGenerator } from '@babel/generator';
import { type ParseResult, parseExpression } from '@babel/parser';
import type { Binding, NodePath } from '@babel/traverse';
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
import * as babelPredicates from '../utils/babel/babel.predicates.js';
import { addJsxExpressionAttribute } from '../utils/babel/babel.utils.js';
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
    memberExpressionIsReactImport,
    identifierIsReactImport,
    extractJSXElementTrees,
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
      },
    );
  }).pipe(Stream.map((x) => Transforms.getJSXElementTree(x)));

const identifierIsReactImport = (path: NodePath<t.Identifier>) => {
  if (path.node.name === 'createElement' && path.parentPath.isCallExpression()) {
    return Option.fromNullable(path.scope.getBinding(path.node.name)).pipe(
      Option.map((x) => isReactRequireBinding(x) || isReactImport(x)),
      Option.getOrElse(() => false),
    );
  }
  return false;
};

const memberExpressionIsReactImport = (path: NodePath<t.MemberExpression>) =>
  maybeReactCreateElementExpression(path).pipe(
    Option.filterMap((x) => {
      if (
        t.isIdentifier(x.object, { name: 'react' }) ||
        t.isIdentifier(x.object, { name: 'React' })
      ) {
        return Option.some(x.object);
      }
      if (
        t.isMemberExpression(x.object) &&
        t.isIdentifier(x.object.object, { name: '_react' }) &&
        t.isIdentifier(x.object.property, { name: 'default' })
      ) {
        return Option.some(x.object.object);
      }
      return Option.none();
    }),
    Option.flatMap((ident) => Option.fromNullable(path.scope.getBinding(ident.name))),
    (x) => [maybeBindingIsReactImport(x), maybeImportDeclaration(x)] as const,
    Option.firstSomeOf,
    Option.getOrElse(() => false),
  );

const maybeReactCreateElementExpression = (
  path: NodePath<t.MemberExpression>,
): Option.Option<t.MemberExpression> =>
  Option.liftPredicate(path.node, (node) =>
    t.isIdentifier(node.property, { name: 'createElement' }),
  );

const maybeCallExpression = (node: Option.Option<t.VariableDeclarator>) =>
  Option.flatMap(node, (x) =>
    t.isCallExpression(x.init) ? Option.some([x, x.init] as const) : Option.none(),
  );

const maybeVariableDeclarator = (binding: Option.Option<Binding>) =>
  Option.flatMap(binding, (x) =>
    x.path.isVariableDeclarator() ? Option.some(x.path.node) : Option.none(),
  );

const maybeImportDeclaration = (binding: Option.Option<Binding>) =>
  Option.flatMap(binding, (x) =>
    x.path.parentPath &&
    t.isImportDeclaration(x.path.parentPath.node) &&
    x.path.parentPath.node.source.value.toLowerCase() === 'react'
      ? Option.some(true)
      : Option.none(),
  );

const maybeBindingIsReactImport = (x: Option.Option<Binding>) =>
  x.pipe(
    maybeVariableDeclarator,
    maybeCallExpression,
    (node) =>
      [
        babelPredicates.isReactRequire(node),
        babelPredicates.isReactInteropRequire(node),
      ] as const,
    Option.firstSomeOf,
  );

const isReactImport = (x: Binding) => {
  if (
    x.path.isImportSpecifier() ||
    x.path.isImportDefaultSpecifier() ||
    x.path.isImportDeclaration() ||
    x.path.isImportNamespaceSpecifier()
  ) {
    return (
      t.isImportDeclaration(x.path.parentPath.node) &&
      x.path.parentPath.node.source.value.toLowerCase() === 'react'
    );
  }

  return false;
};

const isReactRequireBinding = (x: Binding) => {
  if (x.path.isVariableDeclarator() && t.isCallExpression(x.path.node.init)) {
    if (
      t.isIdentifier(x.path.node.init.callee, { name: 'require' }) &&
      t.isStringLiteral(x.path.node.init.arguments[0], { value: 'react' })
    ) {
      return true;
    }

    if (
      // const <name> = _interopRequireDefault(require("react"))
      t.isIdentifier(x.path.node.init.callee, { name: '_interopRequireDefault' }) &&
      t.isCallExpression(x.path.node.init.arguments[0]) &&
      t.isIdentifier(x.path.node.init.arguments[0].callee, { name: 'require' }) &&
      t.isStringLiteral(x.path.node.init.arguments[0].arguments[0], {
        value: 'react',
      })
    ) {
      return true;
    }
  }

  return false;
};
