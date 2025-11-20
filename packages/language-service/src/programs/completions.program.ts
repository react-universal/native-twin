import * as Array from 'effect/Array';
import * as Chunk from 'effect/Chunk';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import type * as vscode from 'vscode-languageserver';
import { Range } from 'vscode-languageserver-types';
import type { TwinRuleCompletion } from '../browser.js';
import { TwinLSPDocumentContext } from '../documents/LSPDocuments.service.js';
import { NativeTwinManagerService } from '../services/NativeTwinManager.service.js';
import { TypescriptApi } from '../TS.js';
import { TwinParserContext } from '../twin/TwinParser.service.js';
import * as Completions from '../utils/language/completions.maps.js';

export const getCompletionsAtPosition = (
  params: vscode.CompletionParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
) =>
  Effect.gen(function* () {
    const documentsHandler = yield* TwinLSPDocumentContext;
    const twinParser = yield* TwinParserContext;
    const tsAPI = yield* TypescriptApi;
    const twinService = yield* NativeTwinManagerService;
    const document = yield* documentsHandler
      .getDocument(params.textDocument.uri)
      .pipe(Effect.map(Option.getOrElse(() => null)));

    if (!document) return [];
    const cursorOffset = document.offsetAt(params.position);

    const sourceFile = tsAPI.createSourceFile(params.textDocument.uri, document.getText());
    const parsedFile = yield* twinParser.parseSourceFile(sourceFile);
    const regions = yield* parsedFile.languageRegions;
    const languageRegionAtPosition = Chunk.findFirst(regions, (x) =>
      document.isPositionAtOffset({ end: x.endOffset, start: x.startOffset }, cursorOffset),
    ).pipe(Option.getOrElse(() => null));

    if (!languageRegionAtPosition) return [];

    const text = document.getText(
      Range.create(document.positionAt(cursorOffset - 1), document.positionAt(cursorOffset + 1)),
    );
    if (text === '``') {
      return Completions.getAllCompletionRules(
        twinService.completions,
        Range.create(document.positionAt(cursorOffset), document.positionAt(cursorOffset + 1)),
      );
    }

    const locatedNodeAtOffset = languageRegionAtPosition
      .getParsedNodeAtOffset(cursorOffset)
      .pipe(Option.getOrElse(() => null));
    if (!locatedNodeAtOffset) return null;

    const tokens = yield* Stream.fromIterableEffect(
      Effect.all(
        locatedNodeAtOffset.flattenToken.flatMap((token) => {
          return twinParser.findRulesByKey(token.getTokenClassName());
        }),
      ),
    ).pipe(
      Stream.flattenIterables,
      Stream.map((registry): TwinRuleCompletion => registry.toRuleCompletion()),
      Stream.runCollect,
      Effect.map(Array.fromIterable),
    );

    // const tokens = getCompletionsForTokens(locatedNodeAtOffset.flattenToken, twinService);
    return Completions.completionRulesToEntries(locatedNodeAtOffset.flattenToken, tokens, document);
  });
