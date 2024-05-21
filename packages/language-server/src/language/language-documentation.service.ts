import * as ReadonlyArray from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver/node';
import { DocumentsService } from '../documents/documents.service';
import { NativeTwinManagerService } from '../native-twin/native-twin.service';
import { createStyledContext, getSheetEntryStyles } from '../utils/sheet.utils';
import { getDocumentTemplatesColors } from './utils/colorInfo.utils';
import { completionRuleToQuickInfo } from './utils/quickInfo.utils';

export class LanguageDocumentation extends Context.Tag('lsp/documentation')<
  LanguageDocumentation,
  {
    readonly getHover: (
      params: vscode.HoverParams,
      _cancelToken: vscode.CancellationToken,
      _progress: vscode.WorkDoneProgressReporter,
      _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
    ) => Effect.Effect<vscode.Hover | undefined>;
    readonly getDocumentColors: (
      params: vscode.DocumentColorParams,
      _cancelToken: vscode.CancellationToken,
      _progress: vscode.WorkDoneProgressReporter,
      _resultProgress:
        | vscode.ResultProgressReporter<vscode.ColorInformation[]>
        | undefined,
    ) => Effect.Effect<vscode.ColorInformation[]>;
  }
>() {
  static Live = Layer.scoped(
    LanguageDocumentation,
    Effect.gen(function* () {
      const twinService = yield* NativeTwinManagerService;
      const documentsHandler = yield* DocumentsService;
      return {
        getHover(params, _cancelToken, _progress, _resultProgress) {
          return Effect.gen(function* () {
            const context = createStyledContext(twinService.userConfig.root.rem);
            const extracted = documentsHandler.getDocument(params.textDocument);

            const hoverEntry = Option.Do.pipe(
              Option.bind('document', () => extracted),
              Option.bind('nodeAdPosition', ({ document }) =>
                document.getTemplateAtPosition(params.position),
              ),

              Option.bind('flattenCompletions', ({ document, nodeAdPosition }) =>
                nodeAdPosition.getParsedNodeAtOffset(
                  document.positionToOffset(params.position),
                ),
              ),
              Option.bind('firstToken', ({ flattenCompletions }) =>
                ReadonlyArray.head(flattenCompletions.flattenToken),
              ),
              Option.let('hoverRange', ({ firstToken, document }) =>
                vscode.Range.create(
                  document.offsetToPosition(firstToken.token.bodyLoc.start),
                  document.offsetToPosition(firstToken.token.bodyLoc.end),
                ),
              ),
              Option.let('finalSheet', ({ firstToken }) =>
                getSheetEntryStyles(twinService.tw(firstToken.token.text), context),
              ),
              Option.map((x) => completionRuleToQuickInfo(x.finalSheet, x.hoverRange)),
            );

            return Option.getOrUndefined(hoverEntry);
          });
        },
        getDocumentColors(params) {
          return Effect.gen(function* () {
            return Option.map(documentsHandler.getDocument(params.textDocument), (x) =>
              getDocumentTemplatesColors(twinService, x),
            ).pipe(
              Option.match({
                onSome: (result): vscode.ColorInformation[] => result,
                onNone: () => [],
              }),
            );
          });
        },
      };
    }),
  );
}
