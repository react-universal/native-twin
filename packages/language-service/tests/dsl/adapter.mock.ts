import { readFileSync } from 'node:fs';
import { identity } from '@native-twin/helpers';
import { Layer } from 'effect';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { TwinLSPDocument } from '../../src';
import { FileNotFound, LSPAdapterSpec } from '../../src/internal/LSPAdapterSpec';
import { JSXParser, TypeScriptProgram } from '../../src/Services';

export const TestVscodeLSPAdapterLive = Effect.gen(function* () {
  const program = yield* TypeScriptProgram;
  const parser = yield* JSXParser;

  const getLSPDocument = Effect.fn(function* (filename) {
    const document = yield* Effect.succeed(
      Option.some(TextDocument.create(filename, 'ts', 1, readFileSync(filename, 'utf-8'))),
    )
      .pipe(Effect.flatMap(identity))
      .pipe(Effect.mapError((e) => FileNotFound.create(e)));

    const tsSource = yield* program.getSourceFile(filename, document.getText());
    const roots = parser.getJSXRootsFromSource(tsSource);
    const regions = parser.jsxNodesToRegions(roots, document);
    // document.loadRegions(regions);
    return new TwinLSPDocument(document, regions);
  });

  const getRegions = Effect.fn('vscodeAdapter: extractRegions')(function* (filename: string) {
    const document = yield* getLSPDocument(filename);
    return document.regions;
  });

  const getRegionAt = Effect.fn('vscodeAdapter: getTokenAtPosition')(
    function* (filename, position) {
      const document = yield* getLSPDocument(filename);
      // const regions = yield* getRegions(filename);

      return document.findRegionAt(position);
    },
  );

  return LSPAdapterSpec.of({
    getLSPDocument,
    getRegions,
    getRegionAt,
  });
}).pipe(Layer.effect(LSPAdapterSpec));
