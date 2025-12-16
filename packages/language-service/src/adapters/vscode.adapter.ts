import { identity } from '@native-twin/helpers';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { TypescriptUtilsLive } from '../browser';
import { LSPContext } from '../core/LSPContext.service';
import * as LSPTypes from '../internal/LSPAdapterSpec';
import { FileNotFound, type Position } from '../models/LSP.models';
import { TwinLSPDocument } from '../models/TwinLSPDocument.model';
import * as JSXParser from '../Typescript/JSXParser.service';
import { TypeScriptProgram } from '../Typescript/TypescriptAPI.service';

export const VscodeLSPAdapterLive = Effect.gen(function* () {
  const { getDocument } = yield* LSPContext;
  const program = yield* TypeScriptProgram;
  const parser = yield* JSXParser.JSXParser;

  const getLSPDocument = Effect.fn(function* (filename: string) {
    const document = yield* Effect.succeed(getDocument(filename))
      .pipe(Effect.flatMap(identity))
      .pipe(Effect.mapError((e) => FileNotFound.create(e)));

    const filePath = filename.replaceAll(/file:\/*/g, '');
    const tsSource = yield* program.getSourceFile(filePath, document.getText());
    const regions = parser.jsxNodesToRegions(parser.getJSXRootsFromSource(tsSource));

    return new TwinLSPDocument(document, regions);
  });

  const getRegions = Effect.fn('vscodeAdapter: extractRegions')(function* (filename: string) {
    const document = yield* getLSPDocument(filename);
    return document.regions;
  });

  const getRegionAt = Effect.fn('vscodeAdapter: getTokenAtPosition')(function* (
    filename: string,
    position: Position,
  ) {
    const document = yield* getLSPDocument(filename);

    return document.findRegionAt(position);
  });

  return LSPTypes.LSPAdapterSpec.of({
    getLSPDocument,
    getRegions,
    getRegionAt,
  });
}).pipe(
  Layer.effect(LSPTypes.LSPAdapterSpec),
  Layer.provide(JSXParser.JSXParserLive),
  Layer.provide(TypescriptUtilsLive),
);
