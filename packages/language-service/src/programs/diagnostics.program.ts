import * as Effect from 'effect/Effect';
import type * as vscode from 'vscode-languageserver';

export const getDocumentDiagnosticsProgram = Effect.fn(function* (
  _params: vscode.DocumentDiagnosticParams,
  _token: vscode.CancellationToken,
  _workDoneProgress: vscode.WorkDoneProgressReporter,
  _resultProgress?:
    | vscode.ResultProgressReporter<vscode.DocumentDiagnosticReportPartialResult>
    | undefined,
) {
  // const twinService: any = {};
  // const documentsHandler = yield* TwinLSPDocumentContext;
  // const document = yield* documentsHandler
  //   .getDocument(params.textDocument.uri)
  //   .pipe(Effect.map(Option.getOrThrow));

  // const regions = yield* documentsHandler.getLanguageRegions(document);

  // const results = RA.map(
  //   regions,
  //   (region) =>
  //     new TwinDiagnosticHandler(region, region.getFullSheetEntries(twinService.tw), document),
  // );

  // const diagnosticItems = pipe(
  //   results.flatMap((x) => x.diagnostics),
  //   RA.dedupeWith((a, b) => isSameRange(a.range, b.range)),
  // );

  yield* Effect.void;
  return {
    kind: 'full',
    // items: diagnosticItems.filter((x) => x.code !== TwinDiagnosticCodes.None),
    items: [],
  } satisfies vscode.DocumentDiagnosticReport;
});
