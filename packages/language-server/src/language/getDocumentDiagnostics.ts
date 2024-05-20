import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver';
import { NativeTwinManagerService } from '../native-twin/native-twin.models';
import {
  diagnosticTokensToDiagnosticItems,
  extractDocumentAndRegions,
  extractDuplicatedTokens,
  extractTokensFromDocumentRegions,
} from './utils/diagnostic';

export const getDocumentDiagnostics = (
  params: vscode.DocumentDiagnosticParams,
  _token: vscode.CancellationToken,
  _workDoneProgress: vscode.WorkDoneProgressReporter,
  _resultProgress?:
    | vscode.ResultProgressReporter<vscode.DocumentDiagnosticReportPartialResult>
    | undefined,
) =>
  Effect.gen(function* () {
    const twinManager = yield* NativeTwinManagerService;
    const extracted = yield* extractDocumentAndRegions(params.textDocument);

    const diagnosticItems = Option.Do.pipe(
      Option.bind('meta', () => extracted),
      Option.let('regionTokens', ({ meta }) => extractTokensFromDocumentRegions(meta)),
      Option.let('duplicatedClassesDiagnostics', ({ meta, regionTokens }) =>
        extractDuplicatedTokens(meta, regionTokens),
      ),
      Option.let('duplicatedDeclarationsProp', ({ regionTokens, meta }) =>
        diagnosticTokensToDiagnosticItems(meta.document, regionTokens, twinManager.tw),
      ),
      Option.map((x) => [...x.duplicatedClassesDiagnostics, ...x.duplicatedDeclarationsProp]),
    );

    return {
      kind: vscode.DocumentDiagnosticReportKind.Full,
      items: Option.getOrElse(diagnosticItems, (): vscode.Diagnostic[] => []),
    } satisfies vscode.DocumentDiagnosticReport;
  });
