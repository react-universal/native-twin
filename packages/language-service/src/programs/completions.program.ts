import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import type * as vscode from 'vscode-languageserver';
import { Range } from 'vscode-languageserver-types';
import { LSPDocumentsService } from '../services/LSPDocuments.service.js';
import { NativeTwinManagerService } from '../services/NativeTwinManager.service.js';
import { getCompletionsForTokens } from '../utils/language/completion.pipes.js';
import * as Completions from '../utils/language/completions.maps.js';

export const getCompletionsAtPosition = (
  params: vscode.CompletionParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
) =>
  Effect.gen(function* () {
    const documentsHandler = yield* LSPDocumentsService;
    const twinService = yield* NativeTwinManagerService;
    const document = yield* documentsHandler
      .getDocument(params.textDocument.uri)
      .pipe(Effect.map(Option.getOrElse(() => null)));

    if (!document) return [];
    const cursorOffset = document.offsetAt(params.position);
    const languageRegionAtPosition = document.getTemplateAtPosition(params.position);
    const text = document.getText(
      Range.create(document.positionAt(cursorOffset - 1), document.positionAt(cursorOffset + 1)),
    );
    if (text === '``') {
      return Completions.getAllCompletionRules(
        twinService.completions,
        Range.create(document.positionAt(cursorOffset), document.positionAt(cursorOffset + 1)),
      );
    }

    return languageRegionAtPosition.pipe(
      Option.flatMap((x) => x.getParsedNodeAtOffset(cursorOffset)),
      Option.map((x) => {
        const tokens = getCompletionsForTokens(x.flattenToken, twinService);
        return Completions.completionRulesToEntries(x.flattenToken, tokens, document);
      }),
      Option.getOrElse((): vscode.CompletionItem[] => []),
    );
  });
