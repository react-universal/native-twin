import type { SheetEntry } from '@native-twin/css';
import * as Effect from 'effect/Effect';
import * as vscode from 'vscode-languageserver';
import { type TwinComposerHandler, TwinLanguageRegionHandler } from '../core/TwinLanguageRegion.model';
import { TwinDiagnosticCodes, VscodeDiagnosticItem } from '../models/diagnostic.model';
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

  const regions = document.parsableRegions.map((x) => x.attr);

  const duplicatedClassNames: VscodeDiagnosticItem[] = [];

  for (const region of regions) {
    const parserResult = parser.runTwinParser({
      startOffset: document.offsetAt(region.range.start),
      text: region.text,
    });
    const handler = new TwinLanguageRegionHandler(region, document, parserResult, tw);
    const diagnostics = getDiagnostics(handler.compositions);

    duplicatedClassNames.push(...diagnostics.duplicatedClassNames.values());
    duplicatedClassNames.push(...diagnostics.duplicatedTwinRules.values());
  }

  return {
    kind: 'full',
    items: duplicatedClassNames.filter((x) => x.code !== TwinDiagnosticCodes.None),
  } satisfies vscode.DocumentDiagnosticReport;
});

const createDiagnostic = (composition: TwinComposerHandler, code: TwinDiagnosticCodes) => {
  return new VscodeDiagnosticItem({
    range: composition.range,
    code,
    entries: composition.classNameTokens,
    relatedInfo: [
      vscode.DiagnosticRelatedInformation.create(composition.location, composition.className),
    ],
    text:
      code === TwinDiagnosticCodes.DuplicatedClassName ? 'Duplicated classname' : 'Rule conflict',
    uri: composition.location.uri,
    // message: getDiagnosticMessage(code),
  });
};

function getDiagnostics(compositions: TwinComposerHandler[]) {
  const duplicatedTwinRules = new Map<string, VscodeDiagnosticItem>();
  const duplicatedClassNames = new Map<string, VscodeDiagnosticItem>();
  const seen = new Map<string, TwinComposerHandler>();
  for (const composition of compositions) {
    if (seen.has(composition.className)) {
      const diagnostic = createDiagnostic(composition, TwinDiagnosticCodes.DuplicatedClassName);
      duplicatedClassNames.set(composition.className, diagnostic);
    }
    if (seen.has(composition.declarationsID)) {
      const diagnostic = createDiagnostic(composition, TwinDiagnosticCodes.DuplicatedClassName);
      duplicatedTwinRules.set(composition.className, diagnostic);
    }
    seen.set(composition.className, composition);
    seen.set(composition.declarationsID, composition);
  }
  return { duplicatedClassNames, duplicatedTwinRules };
}
