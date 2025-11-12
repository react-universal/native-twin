import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import type ts from 'ts-morph';
import type { TwinDslModels } from './TwinDsl.models';
import { TypescriptUtils } from './TypescriptUtils.service';

const make = Effect.gen(function* () {
  const tsUtils = yield* TypescriptUtils;

  return {
    parseSourceFile,
    flattenDeclarators,
  };

  function parseSourceFile(sourceFile: ts.SourceFile) {
    return Stream.fromIterable(sourceFile.getStatements()).pipe(
      Stream.filterMap((_) => Option.fromNullable(tsUtils.getJSXElementStatement(_))),
      Stream.mapEffect(({ jsxElement, declarator }) =>
        Effect.zip(Effect.succeed(declarator), tsUtils.getTwinJSXNode(jsxElement)),
      ),
      Stream.map(
        ([declarator, jsxNode]): TwinDslModels.NodeJSXDeclarator => ({
          _tag: 'NodeJSXDeclarator',
          binding: declarator,
          filename: sourceFile.getFilePath(),
          identifier: declarator.getText(),
          jsxElement: jsxNode,
          node: declarator,
        }),
      ),
      Stream.runCollect,
      Effect.map(
        (declarations): TwinDslModels.TwinSourceFile => ({
          _tag: 'TwinSourceFile',
          jsxDeclarators: RA.fromIterable(declarations),
          node: sourceFile,
        }),
      ),
    );
  }

  function flattenDeclarators(declarator: TwinDslModels.NodeJSXDeclarator) {
    const rootPath = `${declarator.filename}-${declarator.identifier}`;
    const mapped = new Map(flattenNode(declarator.jsxElement, [rootPath]));
    return mapped;

    function flattenNode(
      node: TwinDslModels.JSXNode,
      currentPath: string[],
    ): [string, TwinDslModels.JSXNode][] {
      const nextPath = [...currentPath, `${node.index}`];
      const childs = node.childs.flatMap((x) => flattenNode(x, nextPath));
      return [[nextPath.join('-'), node], ...childs];
    }
  }
});

export interface TwinDSLSvc extends Effect.Effect.Success<typeof make> {}
export const TwinDSLSvc = Context.GenericTag<TwinDSLSvc>('TwinDSLSvc');

export const TwinDSLSvcLive = Layer.effect(TwinDSLSvc, make);
