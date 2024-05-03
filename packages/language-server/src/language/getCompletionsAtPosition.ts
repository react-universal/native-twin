import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver/node';
import { DocumentsService } from '../documents/documents.service';
import { NativeTwinManagerService } from '../native-twin/native-twin.models';
import {
  extractRuleCompletionsFromTemplate,
  extractTemplateAtPosition,
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
    const { completions: twinStore } = yield* NativeTwinManagerService;
    const documentsHandler = yield* DocumentsService;

    return Option.Do.pipe(
      () =>
        extractTemplateAtPosition(
          documentsHandler.getDocument(params.textDocument),
          params.position,
        ),

      Option.let('ruleCompletions', ({ templateAtPosition }) =>
        extractRuleCompletionsFromTemplate(templateAtPosition, twinStore),
      ),

      Option.let('flattenCompletions', ({ cursorOffset, templateAtPosition }) =>
        getTokensAtOffset(templateAtPosition, cursorOffset),
      ),

      Option.let(
        'filteredCompletions',
        ({ ruleCompletions, flattenCompletions, document }) =>
          Completions.completionRulesToEntries(
            flattenCompletions,
            ruleCompletions,
            document,
          ),
      ),
      Option.match({
        onSome: ({ filteredCompletions }) => filteredCompletions,
        onNone: () => [],
      }),
    );
  });
};
