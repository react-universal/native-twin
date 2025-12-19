import type { SheetEntry } from '@native-twin/css';
import { hash } from '@native-twin/helpers';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Stream from 'effect/Stream';
import type * as vscode from 'vscode-languageserver';
import { LSPConfig } from '../core/LSPContext.service';
import { TwinParserContext } from '../core/TwinParser.service';
import { LSPAdapterSpec } from '../internal/LSPAdapterSpec';
import { DiagnosticReport } from '../models/Editor.models';
import { TwinDiagnosticCodes } from '../models/lsp.constants';
import type { ParsedRuleWithLocation, ResolvedTwinResult } from '../models/TwinParser.models';

export interface BaseDiagnosticItem {
  entries: SheetEntry[];
  range: vscode.Range;
  composition: ParsedRuleWithLocation;
}

export const getDocumentDiagnosticsProgram = Effect.fn(function* (
  params: vscode.DocumentDiagnosticParams,
  _token: vscode.CancellationToken,
  _workDoneProgress: vscode.WorkDoneProgressReporter,
  _resultProgress?:
    | vscode.ResultProgressReporter<vscode.DocumentDiagnosticReportPartialResult>
    | undefined,
) {
  const { getLSPDocument } = yield* LSPAdapterSpec;
  const parser = yield* TwinParserContext;
  const { configSelector } = yield* LSPConfig;
  const document = yield* getLSPDocument(params.textDocument.uri);
  const severity = yield* configSelector((x) => x.diagnostics);
  const regions = document.parsableRegions;
  return yield* Stream.fromIterable(regions).pipe(
    Stream.mapEffect(({ attr }) => parser.runFullParserEffect(attr.text, attr.startOffset)),
    Stream.map((results) => {
      const diagnosticReports = new Map<
        string,
        { code: TwinDiagnosticCodes; rules: ResolvedTwinResult[] }
      >();
      evaluateParsedRegion(results, (code, reportID, ...info) => {
        const id = reportID.concat(`${code}`);
        const report = diagnosticReports.get(id);
        if (!report) {
          diagnosticReports.set(id, { code, rules: info });
          return;
        }
        report.rules.push(...info);
        diagnosticReports.set(id, report);
      });
      return RA.flatMap(RA.fromIterable(diagnosticReports.values()), ({ code, rules }) => {
        return rules.map((rule) => {
          const info = rules.map((x) => ({
            location: document.locationAtOffsets(
              x.parsedRegion.startOffset,
              x.parsedRegion.endOffset,
            ),
            text: x.entry?.className ?? '',
          }));
          return new DiagnosticReport({
            code,
            location: document.locationAtOffsets(
              rule.parsedRegion.startOffset,
              rule.parsedRegion.endOffset,
            ),
            severity,
            rules: info,
          });
        });
      });
    }),
    Stream.flattenIterables,
    Stream.runCollect,
    Effect.map(
      (reports) =>
        ({
          kind: 'full',
          resultId: hash(document.uri),
          items: RA.fromIterable(reports).flatMap((x) =>
            x.code === TwinDiagnosticCodes.None ? [] : x.getDiagnostic(),
          ),
        }) satisfies vscode.DocumentDiagnosticReport,
    ),
  );

  function evaluateParsedRegion(
    regions: ResolvedTwinResult[],
    report: (
      code: TwinDiagnosticCodes,
      id: string,
      target: ResolvedTwinResult,
      source: ResolvedTwinResult,
    ) => void,
  ) {
    const seen = new Map<string, ResolvedTwinResult>();

    for (const node of regions) {
      if (!node.entry) continue;
      const selectors = node.parsedRegion.parsed.v.sort().join('');
      const ruleID = selectors.concat(node.entry.declarations.sort().join(''));
      const classNameID = selectors.concat(node.parsedRegion.fullText);
      const ruleComposition = seen.get(ruleID);
      const classComposition = seen.get(classNameID);

      if (classComposition && node !== classComposition) {
        report(TwinDiagnosticCodes.DuplicatedClassName, classNameID, classComposition, node);
      } else seen.set(classNameID, node);

      if (ruleComposition && node !== ruleComposition) {
        report(TwinDiagnosticCodes.DuplicatedDeclaration, ruleID, node, ruleComposition);
      } else {
        seen.set(ruleID, node);
      }
    }
  }
});
