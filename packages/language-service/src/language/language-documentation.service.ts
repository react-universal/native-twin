import { sheetEntriesToCss } from '@native-twin/css';
import * as ReadonlyArray from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import type * as vscode from 'vscode-languageserver';
import { Range } from 'vscode-languageserver-types';
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
              Option.let('cursorOffset', ({ document }) =>
                document.positionToOffset(params.position),
              ),
              Option.bind(
                'tokenAtPosition',
                ({ flattenCompletions, cursorOffset, document }) => {
                  return ReadonlyArray.findFirst(
                    flattenCompletions.flattenToken,
                    (x) =>
                      cursorOffset >= x.token.bodyLoc.start &&
                      cursorOffset <= x.token.bodyLoc.end,
                  ).pipe(
                    Option.map((x): { range: vscode.Range; text: string } => ({
                      range: Range.create(
                        document.offsetToPosition(x.token.bodyLoc.start),
                        document.offsetToPosition(x.token.bodyLoc.end),
                      ),
                      text: x.token.text,
                    })),
                    Option.match({
                      onSome(a) {
                        return Option.some(a);
                      },
                      onNone() {
                        const token = flattenCompletions.token;
                        if (
                          token.type === 'GROUP' &&
                          cursorOffset >= token.value.base.bodyLoc.start &&
                          cursorOffset <= token.value.base.bodyLoc.end
                        ) {
                          return Option.some({
                            range: Range.create(
                              document.offsetToPosition(flattenCompletions.bodyLoc.start),
                              document.offsetToPosition(flattenCompletions.bodyLoc.end),
                            ),
                            text: flattenCompletions.text,
                          });
                        }
                        return Option.none();
                      },
                    }),
                  );
                },
              ),
              Option.map(({ tokenAtPosition }) => {
                const cx = twinService.cx`${tokenAtPosition.text}`;
                const entries = twinService.tx`${[cx]}`;
                const sheet = {
                  rn: getSheetEntryStyles(entries, context),
                  css: sheetEntriesToCss(entries),
                };
                return completionRuleToQuickInfo(
                  sheet.rn,
                  sheet.css,
                  tokenAtPosition.range,
                );
              }),
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
