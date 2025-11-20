import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Stream from 'effect/Stream';
import type ts from 'typescript';
import { TypescriptUtils } from '../plugin/TypescriptUtils.service';
import { TwinParserContext } from '../twin/TwinParser.service';

// export const make = Effect.gen(function* () {
//   // const tsApi = yield* TsPlugin.TypeScriptApi;
//   // const program = yield* TsPlugin.TypeScriptProgram;

//   return {};
// });

export const createCompletionHandler = Effect.fn(function* (
  sourceFile: ts.SourceFile,
  _atOffset: number,
) {
  const parser = yield* TwinParserContext;
  const tsUtils = yield* TypescriptUtils;
  const parsed = yield* parser.parseSourceFile(sourceFile);

  const flattenNodes = parsed.jsxDeclarators.flatMap((x) =>
    RA.fromIterable(tsUtils.flattenDeclarators(x).values()),
  );

  return yield* Stream.fromIterable(flattenNodes).pipe(
    Stream.flatMap((jsxNode) => {
      return Stream.fromIterable(jsxNode.styledProps).pipe(
        Stream.mapEffect((prop) => parser.parseTwinJSXNodeProp(prop)),
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
