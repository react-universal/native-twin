import type { SheetEntry } from '@native-twin/css';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Stream from 'effect/Stream';
import type * as vscode from 'vscode-languageserver';
import { TwinParserContext } from '../core/TwinParser.service';
import { LSPAdapterSpec } from '../internal/LSPAdapterSpec';
import { DiagnosticReport, TwinDiagnosticCodes } from '../models/Diagnostic.model';
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
  const document = yield* getLSPDocument(params.textDocument.uri);

  const regions = document.parsableRegions;
  return yield* Stream.fromIterable(regions).pipe(
    Stream.mapEffect(({ attr }) =>
      parser.runFullParserEffect(attr.text, document.offsetAt(attr.range.start)),
    ),
    Stream.map((results) => {
      const diagnosticReports = new Map<
        string,
        { code: TwinDiagnosticCodes; rules: ResolvedTwinResult[] }
      >();
      evaluateParsedRegion(results, (code, reportID, ...info) => {
        const id = reportID.concat(`${code}`);
        diagnosticReports.set(id, { code, rules: info });
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
      } else {
        seen.set(classNameID, node);
      }

      if (ruleComposition && node !== ruleComposition) {
        report(TwinDiagnosticCodes.DuplicatedDeclaration, ruleID, ruleComposition, node);
      } else {
        seen.set(ruleID, node);
      }
    }
  }
});
