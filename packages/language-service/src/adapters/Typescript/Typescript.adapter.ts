import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { LSPDocumentsCtx, LSPDocumentsCtxLive } from '../../internal/ConnectionHandler.api';
import * as LSPTypes from '../../internal/LSPAdapterSpec';
import { FileNotFound, type Position } from '../../models/LSP.models';
import { TwinLSPDocument } from '../../models/TwinLSPDocument.model';
import * as JSXParser from './JSXParser.service';
import { TypeScriptProgram, TypescriptProgramLive } from './TypescriptAPI.service';
import { TypescriptUtilsLive } from './TypescriptUtils.service';

export const VscodeLSPAdapterLive = Effect.gen(function* () {
  const { getDocument } = yield* LSPDocumentsCtx;
  const program = yield* TypeScriptProgram;
  const parser = yield* JSXParser.JSXParser;

  const getLSPDocument = Effect.fn(function* (filename: string) {
    const document = yield* getDocument(filename).pipe(
      Effect.mapError((e) => FileNotFound.create(e)),
    );

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
  Layer.provide(TypescriptProgramLive),
  Layer.provide(LSPDocumentsCtxLive),
);
