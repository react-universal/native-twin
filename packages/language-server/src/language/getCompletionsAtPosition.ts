import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver/node';
import { DocumentsService } from '../documents/documents.service';
import { NativeTwinManagerService } from '../native-twin/native-twin.models';
import {
  extractTemplateAtPosition,
  extractTemplateTokenAtPosition,
  getTokensAtOffset,
} from './utils/completion.pipes';
import * as Completions from './utils/completions.maps';

export const getCompletionsAtPosition = (
  params: vscode.CompletionParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
) => {
  return Effect.gen(function* () {
    const twinService = yield* NativeTwinManagerService;
    const documentsHandler = yield* DocumentsService;

    return Option.Do.pipe(
      () =>
        extractTemplateAtPosition(
          documentsHandler.getDocument(params.textDocument),
          params.position,
        ),

      Option.bind('tokenAtPosition', ({ templateAtPosition }) =>
        extractTemplateTokenAtPosition(templateAtPosition, params.position, twinService),
      ),

      Option.let('flattenTemplateTokens', ({ cursorOffset, templateAtPosition }) =>
        getTokensAtOffset(templateAtPosition, cursorOffset),
      ),

      Option.let(
        'filteredCompletions',
        ({ tokenAtPosition, flattenTemplateTokens, document }) =>
          Completions.completionRulesToEntries(
            flattenTemplateTokens,
            tokenAtPosition.rules,
            document,
          ),
      ),

      Option.match({
        onSome: (result) => result.filteredCompletions,
        onNone: () => [],
      }),
    );
  });
};
