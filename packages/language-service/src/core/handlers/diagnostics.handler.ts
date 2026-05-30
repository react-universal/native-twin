import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import * as t from 'vscode-languageserver';
import { LSPAdapterSpec, type LSPTextDocument } from '../../internal/LSPAdapterSpec';
import { DiagnosticReport, type DiagnosticReportInput } from '../../models/Editor.models';
import { LSPConstants, TwinDiagnosticCodes } from '../../models/lsp.constants';
import type { ResolvedTwinResult } from '../../models/TwinParser.models';
import { TwinParserContext } from '../TwinParser.service';

interface DiagnosticRaw {
  code: TwinDiagnosticCodes;
  rules: ResolvedTwinResult[];
}
export const createDiagnosticsHandler = Effect.gen(function* () {
  const { getLSPDocument } = yield* LSPAdapterSpec;
  const parser = yield* TwinParserContext;

  const evaluateDocument = Effect.fn(function* (
    uri: t.URI,
    severity: DiagnosticReportInput['severity'],
  ) {
    const document = yield* getLSPDocument(uri);
    return yield* Stream.fromIterable(document.parsableRegions).pipe(
      Stream.mapEffect(({ data }) =>
        parser.runFullParserEffect(data.value.text, data.value.startOffset),
      ),
      Stream.map((results) => {
        const diagnosticReports = new Map<string, DiagnosticRaw>();

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
        return diagnosticReports.values();
      }),
      Stream.flattenIterables,
      Stream.filter((x) => x.code !== TwinDiagnosticCodes.None),
      Stream.map(({ rules, code }) => createDiagnosticReport(rules, code, document, severity)),
      Stream.flattenIterables,
      Stream.runCollect,
    );
  });

  return { evaluateDocument };
});

export const isValidTwinDiagnostic = (x: unknown): x is t.Diagnostic => {
  return (
    t.Diagnostic.is(x) &&
    !!x.code &&
    !!x.relatedInformation &&
    !!x.source &&
    !!x.severity &&
    x.source === LSPConstants.diagnosticProviderSource
  );
};

const createDiagnosticReport = (
  rules: ResolvedTwinResult[],
  code: TwinDiagnosticCodes,
  document: LSPTextDocument,
  severity: DiagnosticReportInput['severity'],
) => {
  const rulesInfo = RA.map(rules, (rule) => ({
    location: document.getParsedRegionRange(rule.parsedRegion),
    text: Option.map(rule.entry, (entry) => entry.className).pipe(Option.getOrElse(() => '')),
  }));
  return RA.map(rules, (rule) =>
    new DiagnosticReport({
      code,
      location: document.getParsedRegionRange(rule.parsedRegion),
      severity,
      rulesInfo: rulesInfo,
    }).getDiagnostic(),
  );
};

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
    const entry = Option.getOrNull(node.entry);
    if (!entry) continue;

    const selectors = node.parsedRegion.parsed.v.sort().join('');
    const ruleID = selectors.concat(entry.declarations.sort().join(''));
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
