import url from 'node:url';
import { identity } from '@native-twin/helpers';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as JSXParser from '../core/JSXParser.service';
import { LSPContext } from '../core/LSP';
import { TypeScriptProgram } from '../core/TypescriptAPI.service';
import * as LSPTypes from '../internal/LSPAdapterSpec';

export interface VscodeLSPAdapter
  extends LSPTypes.LSPAdapterSpec<never, LSPContext | TypeScriptProgram> {}

const getLSPDocument: VscodeLSPAdapter['getLSPDocument'] = Effect.fn(function* (filename) {
  const documentsService = yield* LSPContext;
  const document = yield* Effect.succeed(documentsService.getDocument(filename))
    .pipe(Effect.flatMap(identity))
    .pipe(Effect.mapError((e) => LSPTypes.FileNotFound.create(e)));

  return {
    document: document,
    getOffsetAt: document.offsetAt,
    getPositionAt: document.positionAt,
    getText: document.getText,
  };
});

const getProGramSourceFile = Effect.fn('ts: getSourceFile')(function* (filename: string) {
  const program = yield* TypeScriptProgram;

  const filePath = url.fileURLToPath(filename);
  return yield* program.getSourceFile(filePath);
  // return yield* Effect.try({
  //   try: () => program.getSourceFile(filePath),
  //   catch: (error) =>
  //     LSPTypes.LSPParserError.create(error instanceof Error ? error : `Parser error: ${error}`),
  // }).pipe(
  //   Effect.andThen(Effect.fromNullable),
  //   Effect.mapError((error) =>
  //     Cause.isNoSuchElementException(error)
  //       ? LSPTypes.FileNotFound.create(`Cant fund file: ${filename}`)
  //       : error,
  //   ),
  // );
});

const getRegions: VscodeLSPAdapter['getRegions'] = Effect.fn('vscodeAdapter: extractRegions')(
  function* (filename: string) {
    const parser = yield* JSXParser.JSXParser;
    const tsSource = yield* getProGramSourceFile(filename);

    const jsxNodes = parser.jsxNodesToRegions(parser.getJSXRootsFromSource(tsSource), tsSource);

    return jsxNodes;
  },
);

const getRegionAt: VscodeLSPAdapter['getRegionAt'] = Effect.fn('vscodeAdapter: getTokenAtPosition')(
  function* (filename, position) {
    const document = yield* getLSPDocument(filename);
    const parser = yield* JSXParser.JSXParser;

    const tsSource = yield* getProGramSourceFile(filename);
    const jsxNodes = parser.getJSXRootsFromSource(tsSource);
    const offset = document.document.offsetAt(position);

    for (const node of jsxNodes.filter((x) => x)) {
      if (offset <= node.pos || offset >= node.end) continue;
      const childs = parser.jsxNodesToRegions([node], tsSource);
      const child = childs.find((x) =>
        LSPTypes.isPositionInRange(x.range, LSPTypes.position(offset)),
      );
      return Option.fromNullable(child);
    }

    return Option.none<LSPTypes.AnyTwinNodeRegion>();
  },
);

export const VscodeLSPAdapter = {
  getLSPDocument,
  getRegionAt,
  getRegions,
} satisfies VscodeLSPAdapter;

// const getVscodeFileHandler = Effect.fn('vscode: Get file handler')(function* (
//   filename: string,
// ): Effect.fn.Return<BaseTwinTextDocument, LSPTypes.AnyLSPError, TwinLSPDocumentContext> {
//   const documents = yield* TwinLSPDocumentContext;
//   const document = yield* documents.getDocument(filename).pipe(Effect.map(Option.getOrNull));

//   if (!document) {
//     return yield* Effect.fail(LSPTypes.FileNotFound.create(`cant find file: ${filename}`));
//   }

//   return document;
// });

export const vscodeLSPAdapterExecutor = LSPTypes.createLSPAdapterExecutor(VscodeLSPAdapter);
