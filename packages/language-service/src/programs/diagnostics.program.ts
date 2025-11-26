import type { SheetEntry } from '@native-twin/css';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as vscode from 'vscode-languageserver';
import { TwinDiagnosticCodes, VscodeDiagnosticItem } from '../models/diagnostic.model';
import { type TwinComposerHandler, TwinLanguageRegion } from '../models/TwinLanguageRegion.model';
import type { AnyTwinComposedClass } from '../models/TwinParser.models';
import { LSPAdapterSpec, TwinParserContext } from '../Services';

export interface BaseDiagnosticItem {
  entries: SheetEntry[];
  range: vscode.Range;
  composition: AnyTwinComposedClass;
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
      compositions.map((comp) => createDiagnostic(comp, code, compositions.map(createRelatedInfo))),
  );

  return {
    kind: 'full',
    items: finalDiag.filter((x) => x.code !== TwinDiagnosticCodes.None),
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

const createRelatedInfo = (composition: TwinComposerHandler) =>
  vscode.DiagnosticRelatedInformation.create(composition.location, composition.className);

const createDiagnostic = (
  composition: TwinComposerHandler,
  code: TwinDiagnosticCodes,
  relatedInfo: vscode.DiagnosticRelatedInformation[],
) => {
  return new VscodeDiagnosticItem({
    range: composition.range,
    code,
    entries: composition.classNameTokens,
    relatedInfo: RA.dedupeWith(relatedInfo, (a, b) => a.location === b.location),
    text:
      code === TwinDiagnosticCodes.DuplicatedClassName ? 'Duplicated classname' : 'Rule conflict',
    uri: composition.location.uri,
    // message: getDiagnosticMessage(code),
  });
};
