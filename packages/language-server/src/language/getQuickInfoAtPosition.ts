import * as ReadonlyArray from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver/node';
import { DocumentsService } from '../documents/documents.service';
import { NativeTwinManagerService } from '../native-twin/native-twin.models';
import { createStyledContext, getSheetEntryStyles } from '../utils/sheet.utils';
import { extractTemplateAtPosition, getTokensAtOffset } from './utils/completion.pipes';
import * as Completions from './utils/completions.maps';

export const getQuickInfoAtPosition = (
  params: vscode.HoverParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
): Effect.Effect<
  vscode.Hover | undefined,
  never,
  DocumentsService | NativeTwinManagerService
> => {
  return Effect.gen(function* () {
    const documentsHandler = yield* DocumentsService;
    const twinManager = yield* NativeTwinManagerService;
    const context = createStyledContext(twinManager.userConfig.root.rem);

    const hoverEntry = Option.Do.pipe(
      () =>
        extractTemplateAtPosition(
          documentsHandler.getDocument(params.textDocument),
          params.position,
        ),

      Option.let('flattenCompletions', ({ cursorOffset, templateAtPosition }) =>
        getTokensAtOffset(templateAtPosition, cursorOffset),
      ),
      Option.bind('firstToken', ({ flattenCompletions }) =>
        ReadonlyArray.head(flattenCompletions),
      ),
      Option.let('hoverRange', ({ firstToken, document }) =>
        vscode.Range.create(
          document.handler.positionAt(firstToken.token.bodyLoc.start),
          document.handler.positionAt(firstToken.token.bodyLoc.end),
        ),
      ),
      Option.let('finalSheet', ({ firstToken }) =>
        getSheetEntryStyles(twinManager.tw(firstToken.token.text), context),
      ),
      Option.map((x) =>
        Completions.completionRuleToQuickInfo(x.finalSheet, x.hoverRange),
      ),
    );

    return Option.getOrUndefined(hoverEntry);
  });
};