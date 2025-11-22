import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import type * as vscode from 'vscode-languageserver';
import { TwinLSPDocumentContext } from '../documents/LSPDocuments.service.js';

export const getHoverDetails = Effect.fn(function* (
  params: vscode.HoverParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
) {
  // const twinService: any = {};
  const documentsHandler = yield* TwinLSPDocumentContext;
  // const context = twinService.getCompilerContext();
  const extracted = yield* documentsHandler.getDocument(params.textDocument.uri);
  const document = Option.getOrUndefined(extracted);

  if (!document) return undefined;

  // const nodeAtPosition = yield* documentsHandler.findTokenAtPosition(document, params.position);
  // const cursorOffset = document.offsetAt(params.position);
  // const flattenCompletions = Option.flatMap(nodeAtPosition, (x) =>
  //   x.getParsedNodeAtOffset(cursorOffset),
  // );

  // const hoverEntry = Option.Do.pipe(
  //   Option.bind('flattenCompletions', () => flattenCompletions),
  //   Option.bind('tokenAtPosition', ({ flattenCompletions }) => {
  //     return RA.findFirst(
  //       flattenCompletions.flattenToken,
  //       (x) => cursorOffset >= x.token.bodyLoc.start && cursorOffset <= x.token.bodyLoc.end,
  //     ).pipe(
  //       Option.map((x): { range: vscode.Range; text: string } => ({
  //         range: Range.create(
  //           document.positionAt(x.token.bodyLoc.start),
  //           document.positionAt(x.token.bodyLoc.end),
  //         ),
  //         text: x.token.text,
  //       })),
  //       Option.match({
  //         onSome: (a) => Option.some(a),
  //         onNone() {
  //           const token = flattenCompletions.token;
  //           if (
  //             token.type === 'GROUP' &&
  //             cursorOffset >= token.value.base.bodyLoc.start &&
  //             cursorOffset <= token.value.base.bodyLoc.end
  //           ) {
  //             return Option.some({
  //               range: Range.create(
  //                 document.positionAt(flattenCompletions.bodyLoc.start),
  //                 document.positionAt(flattenCompletions.bodyLoc.end),
  //               ),
  //               text: flattenCompletions.text,
  //             });
  //           }
  //           return Option.none();
  //         },
  //       }),
  //     );
  //   }),
  //   Option.map(({ tokenAtPosition }) => {
  //     const cx = twinService.cx`${tokenAtPosition.text}`;
  //     const entries = twinService.tw(`${cx}`);
  //     const sheet = {
  //       rn: getSheetEntryStyles(entries, context),
  //       css: sheetEntriesToCss(entries),
  //     };
  //     return completionRuleToQuickInfo(sheet.rn, sheet.css, tokenAtPosition.range);
  //   }),
  // );

  return undefined;
});
