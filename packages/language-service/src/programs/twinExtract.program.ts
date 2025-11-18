import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Stream from 'effect/Stream';
import { TypescriptApi, TypescriptUtils } from '../typescript';

export const twinTSExtract = Effect.fn(function* (filePath: string, code: string) {
  const tsAPI = yield* TypescriptApi;
  const source = tsAPI.createSourceFile(filePath, code);
  const parsed = yield* tsAPI.parseSourceFile(source);
  const tsUtils = yield* TypescriptUtils;

  return yield* Stream.fromIterable(
    parsed.jsxDeclarators.flatMap((_) => RA.fromIterable(tsAPI.flattenDeclarators(_).values())),
  ).pipe(
    Stream.flatMap((jsxNode) => {
      return Stream.fromIterable(jsxNode.styledProps).pipe(
        Stream.mapEffect((prop) => tsUtils.parseTwinJSXNodeProp(prop)),
        Stream.map((evaluated) => Object.assign(evaluated, { jsxNode })),
      );
    }),
    Stream.runCollect,
    Effect.map((chunks) => {
      return {
        jsxNodes: RA.fromIterable(chunks),
        source,
      };
    }),
  );
});
