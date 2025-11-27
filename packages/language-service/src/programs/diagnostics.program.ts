import type { SheetEntry } from '@native-twin/css';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import type * as vscode from 'vscode-languageserver';
import { DiagnosticReport, TwinDiagnosticCodes } from '../models/Diagnostic.model';
import { type TwinComposerHandler, TwinLanguageRegion } from '../models/TwinLanguageRegion.model';
import type { ParsedRuleWithLocation } from '../models/TwinParser.models';
import { LSPAdapterSpec, TwinParserContext } from '../Services';

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
  const tw = yield* parser.data.twinRef.get;

  const regions = document.parsableRegions;
  const diagnosticReports = new Map<
    string,
    { code: TwinDiagnosticCodes; compositions: TwinComposerHandler[] }
  >();
  for (const { attr: region, region: jsxNode } of regions) {
    // const parsed = yield* parser.runFullParserEffect(
    //   region.text,
    //   document.offsetAt(region.range.start),
    // );
    const entries = tw(region.text);
    const handler = new TwinLanguageRegion(
      jsxNode,
      region,
      document.getLocation(region.range),
      entries,
    );
    getDiagnostics(handler.compositions, (code, ...compositions) => {
      const { classNameID, ruleID } = compositions[0].ids;
      const id = (code === TwinDiagnosticCodes.DuplicatedClassName ? classNameID : ruleID).concat(
        `${code}`,
      );
      if (!diagnosticReports.has(ruleID)) {
        diagnosticReports.set(id, { code, compositions });
        return;
      }
      const ruleDup = diagnosticReports.get(ruleID)!;
      ruleDup.compositions.push(...compositions);
      diagnosticReports.set(ruleID, ruleDup);
    });
  }

  const finalDiag = RA.flatMap(
    RA.fromIterable(diagnosticReports.values()),
    ({ compositions, code }) =>
      compositions.map(
        (comp) => new DiagnosticReport({ code, location: comp.location, rules: compositions }),
      ),
  );

  return {
    kind: 'full',
    items: finalDiag.flatMap((x) => (x.code !== TwinDiagnosticCodes.None ? [] : x.getDiagnostic())),
  } satisfies vscode.DocumentDiagnosticReport;
});

function getDiagnostics(
  compositions: TwinComposerHandler[],
  report: (
    code: TwinDiagnosticCodes,
    target: TwinComposerHandler,
    source: TwinComposerHandler,
  ) => void,
) {
  const seen = new Map<string, TwinComposerHandler>();
  for (const composition of compositions) {
    const entries = composition.sheetEntries;
    const { classNameID, ruleID } = composition.ids;
    const ruleComposition = seen.get(ruleID);
    const classComposition = seen.get(classNameID);
    if (classComposition && composition !== classComposition) {
      report(TwinDiagnosticCodes.DuplicatedClassName, seen.get(classNameID)!, composition);
      continue;
    } else {
      seen.set(classNameID, composition);
    }
    if (ruleComposition && composition !== ruleComposition && entries.length > 0) {
      report(TwinDiagnosticCodes.DuplicatedDeclaration, seen.get(ruleID)!, composition);
    } else {
      seen.set(ruleID, composition);
    }
  }
}
