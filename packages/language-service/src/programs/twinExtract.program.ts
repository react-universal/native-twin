import { readFileSync } from 'node:fs';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Stream from 'effect/Stream';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { JSXParser } from '../core/JSXParser.service';
import { TwinLSPDocument } from '../core/TwinLSPDocument.model';
import * as Typescript from '../core/TypescriptAPI.service';

export const twinTSExtract = Effect.fn(function* (filePath: string) {
  const program = yield* Typescript.TypeScriptProgram;
  const source = yield* program.getSourceFile(filePath, readFileSync(filePath, 'utf-8'));
  const jsxParser = yield* JSXParser;
  const parsed = yield* jsxParser.parseSourceFile(source);
  const rawDocument = TextDocument.create(filePath, 'typescript', 1, source.getText());
  const nodes = parsed.jsxDeclarators
    .flatMap((decl) => Array.from(jsxParser.flatJSXDeclarator(decl).values()))
    .flatMap((x) => x.getAllNodes())
    .map((x) => x.node);
  const regions = jsxParser.jsxNodesToRegions(nodes, rawDocument);

  new TwinLSPDocument(rawDocument, regions);

  return yield* Stream.fromIterable(
    parsed.jsxDeclarators.flatMap((_) => RA.fromIterable(jsxParser.flatJSXDeclarator(_).values())),
  ).pipe(
    Stream.flatMap((jsxNode) => {
      return Stream.fromIterable(jsxNode.styledProps).pipe(
        Stream.mapEffect((prop) => jsxParser.parseTwinJSXNodeProp(prop, rawDocument)),
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
