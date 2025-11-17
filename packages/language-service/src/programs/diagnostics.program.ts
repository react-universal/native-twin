import { pipe } from 'effect';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import type * as vscode from 'vscode-languageserver';
import { TwinLSPDocumentContext } from '../documents/LSPDocuments.service.js';
import { TwinDiagnosticHandler } from '../lsp/language/diagnostic.cache.js';
import { TwinDiagnosticCodes } from '../lsp/language/diagnostic.model.js';
import { NativeTwinManagerService } from '../services/NativeTwinManager.service.js';
import { isSameRange } from '../utils/vscode.utils.js';

export const getDocumentDiagnosticsProgram = Effect.fn(function* (
  params: vscode.DocumentDiagnosticParams,
  _token: vscode.CancellationToken,
  _workDoneProgress: vscode.WorkDoneProgressReporter,
  _resultProgress?:
    | vscode.ResultProgressReporter<vscode.DocumentDiagnosticReportPartialResult>
    | undefined,
) {
  const twinService = yield* NativeTwinManagerService;
  const documentsHandler = yield* TwinLSPDocumentContext;
  const document = yield* documentsHandler
    .getDocument(params.textDocument.uri)
    .pipe(Effect.map(Option.getOrThrow));

  const regions = yield* documentsHandler.getLanguageRegions(document);

  const results = RA.map(
    regions,
    (region) =>
      new TwinDiagnosticHandler(region, region.getFullSheetEntries(twinService.tw), document),
  );

  const diagnosticItems = pipe(
    results.flatMap((x) => x.diagnostics),
    RA.dedupeWith((a, b) => isSameRange(a.range, b.range)),
  );

  return {
    kind: 'full',
    items: diagnosticItems.filter((x) => x.code !== TwinDiagnosticCodes.None),
  } satisfies vscode.DocumentDiagnosticReport;
});
