import * as Effect from 'effect/Effect';
import type * as vscode from 'vscode-languageserver';

// export const vscodeCompletionsProgram = (filename: string, position: vscode.Position) =>
//   classNameCompletions.apply(filename, position, vscodeLSPAdapterExecutor);

export const getCompletionsAtPosition = (
  _params: vscode.CompletionParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
) =>
  Effect.gen(function* () {
    // const documentsHandler = yield* TwinLSPDocumentContext;
    // const twinParser = yield* TwinParserContext;
    // const tsAPI = yield* TypescriptApi;
    // const twinService = yield* NativeTwinManagerService;
    // const jsxParser = yield* JSXParser;
    // const document = yield* documentsHandler
    //   .getDocument(params.textDocument.uri)
    //   .pipe(Effect.map(Option.getOrElse(() => null)));

    // if (!document) return [];
    // const cursorOffset = document.offsetAt(params.position);

    // const sourceFile = tsAPI.createSourceFile(params.textDocument.uri, document.getText());
    // const parsedFile = yield* jsxParser.parseSourceFile(sourceFile);
    // const regions = yield* parsedFile.languageRegions;
    // const languageRegionAtPosition = Chunk.findFirst(regions, (x) =>
    //   document.isPositionAtOffset({ end: x.endOffset, start: x.startOffset }, cursorOffset),
    // ).pipe(Option.getOrElse(() => null));

    // if (!languageRegionAtPosition) return [];

    // const text = document.getText(
    //   Range.create(document.positionAt(cursorOffset - 1), document.positionAt(cursorOffset + 1)),
    // );
    // if (text === '``') {
    //   return Completions.getAllCompletionRules(
    //     twinService.completions,
    //     Range.create(document.positionAt(cursorOffset), document.positionAt(cursorOffset + 1)),
    //   );
    // }

    // const locatedNodeAtOffset = languageRegionAtPosition
    //   .getParsedNodeAtOffset(cursorOffset)
    //   .pipe(Option.getOrElse(() => null));
    // if (!locatedNodeAtOffset) return null;

    // const tokens = yield* Stream.fromIterableEffect(
    //   Effect.all(
    //     locatedNodeAtOffset.flattenToken.flatMap((token) => {
    //       return twinParser.findRulesByKey(token.getTokenClassName());
    //     }),
    //   ),
    // ).pipe(
    //   Stream.flattenIterables,
    //   Stream.map((registry): TwinRuleCompletion => registry.toRuleCompletion()),
    //   Stream.runCollect,
    //   Effect.map(Array.fromIterable),
    // );

    // const tokens = getCompletionsForTokens(locatedNodeAtOffset.flattenToken, twinService);
    // return Completions.completionRulesToEntries(locatedNodeAtOffset.flattenToken, tokens, document);
    return yield* Effect.succeed([]);
  });
