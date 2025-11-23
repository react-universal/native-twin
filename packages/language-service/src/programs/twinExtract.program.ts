import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Stream from 'effect/Stream';
import { JSXParser } from '../core/JSXParser.service';
import * as Typescript from '../core/TypescriptAPI.service';

export const twinTSExtract = Effect.fn(function* (filePath: string) {
  const program = yield* Typescript.TypeScriptProgram;
  const source = yield* program.getSourceFile(filePath);
  if (!source) {
    return yield* Effect.fail('asdasd');
  }
  const jsxParser = yield* JSXParser;
  const parsed = yield* jsxParser.parseSourceFile(source);

  return yield* Stream.fromIterable(
    parsed.jsxDeclarators.flatMap((_) => RA.fromIterable(jsxParser.flatJSXDeclarator(_).values())),
  ).pipe(
    Stream.flatMap((jsxNode) => {
      return Stream.fromIterable(jsxNode.styledProps).pipe(
        Stream.mapEffect((prop) => jsxParser.parseTwinJSXNodeProp(prop)),
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
