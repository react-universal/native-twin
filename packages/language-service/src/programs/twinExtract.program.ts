import { readFileSync } from 'node:fs';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Stream from 'effect/Stream';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { JSXParser } from '../core/JSXParser.service';
import * as Typescript from '../core/TypescriptAPI.service';
import { TwinLSPDocument } from '../documents/node/TwinLSPDocument.model';

export const twinTSExtract = Effect.fn(function* (filePath: string) {
  const program = yield* Typescript.TypeScriptProgram;
  const source = yield* program.getSourceFile(filePath, readFileSync(filePath, 'utf-8'));
  const jsxParser = yield* JSXParser;
  const parsed = yield* jsxParser.parseSourceFile(source);
  const document = new TwinLSPDocument(
    TextDocument.create(filePath, 'typescript', 1, source.getText()),
  );

  return yield* Stream.fromIterable(
    parsed.jsxDeclarators.flatMap((_) => RA.fromIterable(jsxParser.flatJSXDeclarator(_).values())),
  ).pipe(
    Stream.flatMap((jsxNode) => {
      return Stream.fromIterable(jsxNode.styledProps).pipe(
        Stream.mapEffect((prop) => jsxParser.parseTwinJSXNodeProp(prop, document)),
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
