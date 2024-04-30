import * as ReadonlyArray from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver/node';
import { DocumentsService } from '../documents/documents.service';
import { NativeTwinManagerService } from '../native-twin/native-twin.models';
import { createStyledContext, getSheetEntryStyles } from '../utils/sheet.utils';
import { extractDocumentAndPositions } from './utils/completion.pipes';
import * as Completions from './utils/completions.maps';
import {
  extractTokensAtPositionFromTemplateNode,
  getRangeFromTokensAtPosition,
} from './utils/language.utils';

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
        extractDocumentAndPositions(
          documentsHandler.getDocument(params.textDocument),
          params.position,
        ),
      Option.let('tokensWithText', ({ document, nodeAtPosition }) =>
        extractTokensAtPositionFromTemplateNode(
          document,
          nodeAtPosition,
          params.position,
        ),
      ),
      Option.bind('firstToken', ({ tokensWithText }) =>
        ReadonlyArray.head(tokensWithText),
      ),
      Option.bind('hoverRange', ({ document, tokensWithText, nodeAtPosition }) =>
        ReadonlyArray.head(
          getRangeFromTokensAtPosition(document, nodeAtPosition, tokensWithText),
        ),
      ),
      Option.let('finalSheet', ({ firstToken }) =>
        getSheetEntryStyles(twinManager.tw(firstToken.text), context),
      ),
      Option.map((x) =>
        Completions.completionRuleToQuickInfo(x.finalSheet, x.hoverRange),
      ),
    );

    return Option.getOrUndefined(hoverEntry);
  });
};
