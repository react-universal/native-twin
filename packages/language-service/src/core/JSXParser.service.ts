import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import ts from 'typescript';
import type { JSXNode, TwinDslModels } from '../models/TwinDsl.models';
import { TwinSourceFile } from '../models/TwinSourceFile';
import { TwinParserContext } from '../twin/TwinParser.service';
import { TypescriptUtils } from './TypescriptUtils.service';

const make = Effect.gen(function* () {
  const tsUtils = yield* TypescriptUtils;
  const twinParser = yield* TwinParserContext;

  function parseSourceFile(sourceFile: ts.SourceFile) {
    return Stream.fromIterable(sourceFile.statements).pipe(
      Stream.filterMap((_) => Option.fromNullable(getJSXElementStatement(_))),
      Stream.mapEffect(({ jsxElement, declarator }) =>
        Effect.zip(Effect.succeed(declarator), tsUtils.getTwinJSXNode(jsxElement, sourceFile)),
      ),
      Stream.map(([...args]) => makeNodeJSXDeclarator(...args)),
      Stream.runCollect,
      Effect.map((declarations) => new TwinSourceFile(sourceFile, RA.fromIterable(declarations))),
    );
  }

  const getJSXElementStatement = (node: ts.Statement) => {
    if (ts.isVariableStatement(node)) {
      const declarations = node.declarationList.declarations;
      for (const declaration of declarations) {
        const initializer = declaration.initializer;
        if (!initializer) continue;
        const returnStat = tsUtils.getFunctionReturn(initializer);
        if (!returnStat) continue;
        const expression = returnStat.expression;
        if (expression && ts.isParenthesizedExpression(expression)) {
          const maybeJSX = expression.expression;
          if (ts.isJsxElement(maybeJSX)) {
            return { jsxElement: maybeJSX, declarator: declaration.name };
          }
        }
      }
    }
    return null;
  };

  function parseTwinJSXNodeProp(prop: TwinDslModels.NodeStyledProp, sourceFile?: ts.SourceFile) {
    const parsedNodes = twinParser.runTwinParser(
      prop.twinCX,
      prop.valueTextNode?.getStart(sourceFile) ?? 0,
    );
    return Stream.fromIterable(parsedNodes.nodes).pipe(
      Stream.mapEffect((composedClass) =>
        Effect.all({
          composedClass: Effect.succeed(composedClass),
          evaluated: twinParser.getRuleByClassName(composedClass.classNameText),
        }),
      ),
      Stream.filterMap((result) =>
        Option.map(result.evaluated, (evaluated) => ({
          evaluated,
          composedClass: result.composedClass,
        })),
      ),
      Stream.runCollect,
      Effect.map(RA.fromIterable),
      Effect.map((parsed) => ({ parsed, prop })),
    );
  }

  function flatJSXDeclarator(declarator: TwinDslModels.NodeJSXDeclarator) {
    const rootPath = `${declarator.filename}-${declarator.identifier}`;
    const mapped = new Map(flattenNode(declarator.jsxElement, [rootPath]));
    return mapped;

    function flattenNode(node: JSXNode, currentPath: string[]): [string, JSXNode][] {
      const nextPath = [...currentPath, `${node.index}`];
      const childs = node.childs.flatMap((x) => flattenNode(x, nextPath));
      return [[nextPath.join('-').concat(node.id), node], ...childs];
    }
  }

  const runTwinOnSourceFile = (sourceFile: ts.SourceFile) =>
    Effect.gen(function* () {
      const parsed = yield* parseSourceFile(sourceFile);

      const flattenNodes = parsed.jsxDeclarators.flatMap((x) =>
        RA.fromIterable(flatJSXDeclarator(x).values()),
      );

      return yield* Stream.fromIterable(flattenNodes).pipe(
        Stream.flatMap((jsxNode) => {
          return Stream.fromIterable(jsxNode.styledProps).pipe(
            Stream.mapEffect((prop) => parseTwinJSXNodeProp(prop, sourceFile)),
            Stream.map((evaluated) => Object.assign(evaluated, { jsxNode })),
          );
        }),
        Stream.runCollect,
        Effect.map((chunks) => {
          return {
            jsxNodes: RA.fromIterable(chunks),
            sourceFile,
          };
        }),
      );
    });

  return { parseSourceFile, flatJSXDeclarator, parseTwinJSXNodeProp, runTwinOnSourceFile };
});

const makeNodeJSXDeclarator = (
  declarator: ts.BindingName,
  jsxElement: JSXNode,
): TwinDslModels.NodeJSXDeclarator => ({
  _tag: 'NodeJSXDeclarator',
  binding: declarator,
  filename: jsxElement.node.getSourceFile().fileName,
  identifier: declarator.getText(),
  jsxElement,
  node: declarator,
});

export interface JSXParser extends Effect.Effect.Success<typeof make> {}
export const JSXParser = Context.GenericTag<JSXParser>('JSXParser');
export const JSXParserLive = Layer.effect(JSXParser, make);
