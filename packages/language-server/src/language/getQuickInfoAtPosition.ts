import * as ReadonlyArray from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver/node';
import { ConfigManagerService } from '../connection/client.config';
import { DocumentsService } from '../documents/documents.service';
import { NativeTwinManagerService } from '../native-twin/native-twin.models';
import { createStyledContext, getSheetEntryStyles } from '../utils/sheet.utils';
import {
  extractDocumentNodeAtPosition,
  extractParsedNodesAtPosition,
} from './utils/completion.pipes';
import * as Completions from './utils/completions.maps';

export const getQuickInfoAtPosition = (
  params: vscode.HoverParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
): Effect.Effect<
  vscode.Hover | undefined,
  never,
  DocumentsService | NativeTwinManagerService | ConfigManagerService
> => {
  return Effect.gen(function* () {
    const twinManager = yield* NativeTwinManagerService;
    const context = createStyledContext(twinManager.userConfig.root.rem);

    const extracted = yield* extractDocumentNodeAtPosition(params);

    const hoverEntry = Option.Do.pipe(
      () => extracted,

      Option.bind('flattenCompletions', ({ cursorOffset, parsedText }) =>
        extractParsedNodesAtPosition({
          cursorOffset,
          parsedText,
        }),
      ),
      Option.bind('firstToken', ({ flattenCompletions }) =>
        ReadonlyArray.head(flattenCompletions.flattenNodes),
      ),
      Option.let('hoverRange', ({ firstToken, document }) =>
        vscode.Range.create(
          document.positionAt(firstToken.token.bodyLoc.start),
          document.positionAt(firstToken.token.bodyLoc.end),
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
