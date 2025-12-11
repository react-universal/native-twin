import { asArray } from '@native-twin/helpers';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as vscodeLSP from 'vscode-languageserver-protocol';
import { LSPAdapterSpec } from '../internal/LSPAdapterSpec';
import { TwinDiagnosticCodes } from '../models/Diagnostic.model';
import type { JsxAttributeValueRegion } from '../models/LSP.models';
import { LSPConstants } from '../models/lsp.constants';
import type { TwinLSPDocument } from '../models/TwinLSPDocument.model';

export const twinCodeActionsProgram = Effect.fn(function* (params: vscodeLSP.CodeActionParams) {
  if (params.context.diagnostics.length === 0) return null;

  const { getLSPDocument } = yield* LSPAdapterSpec;
  const document = yield* getLSPDocument(params.textDocument.uri);

  const diagnostics = RA.filterMap(params.context.diagnostics, (x) => {
    if (
      !x.code ||
      !x.relatedInformation ||
      !x.source ||
      !x.severity ||
      x.source !== LSPConstants.diagnosticProviderSource
    ) {
      return Option.none();
    }

    return Option.some(x);
  });

  const region = document.findRegionAt(params.range.start);
  if (!region) return null;
  const editsForDuplicatedDeclarations: vscodeLSP.CodeAction[] = pipe(
    RA.filter(diagnostics, (x) => x.code === TwinDiagnosticCodes.DuplicatedDeclaration),
    RA.map((x) => getActionsForDuplicatedDecl(x, document.uri)),
  );

  return editsForDuplicatedDeclarations;
});

export const getDuplicatedDeclarationCodeAction = (
  twinDoc: TwinLSPDocument,
  region: JsxAttributeValueRegion,
  diagnostics: vscodeLSP.Diagnostic[],
) => {
  const textsToRemove = pipe(
    RA.flatMap(diagnostics, (x) =>
      RA.map(asArray(x.relatedInformation), diagnosticRelatedInfoToEdit),
    ),
    RA.map((info) => twinDoc.getText(info.textEdit.range)),
  );

  let newText = region.text;
  for (const edit of textsToRemove) {
    newText = newText.replace(edit, '');
  }
  newText = newText.replaceAll(/\s+/g, ' ');
  const fix = vscodeLSP.CodeAction.create(
    'Remove duplicated utilities',
    vscodeLSP.CodeActionKind.QuickFix,
  );

  fix.edit = {
    changes: {
      [twinDoc.uri]: asArray(vscodeLSP.TextEdit.replace(region.range, newText)),
    },
  };
  fix.isPreferred = true;
  fix.diagnostics = diagnostics;
  return asArray(fix);
};

const diagnosticRelatedInfoToEdit = (item: vscodeLSP.DiagnosticRelatedInformation) => {
  return {
    textEdit: vscodeLSP.TextEdit.replace(item.location.range, ''),
    message: item.message,
  };
};

const getActionsForDuplicatedDecl = (
  diagnosticItem: vscodeLSP.Diagnostic,
  uri: string,
): vscodeLSP.CodeAction => {
  const textEdits = RA.map(asArray(diagnosticItem.relatedInformation), diagnosticRelatedInfoToEdit);

  const fix = vscodeLSP.CodeAction.create(
    `Remove duplicated utilities`,
    {
      changes: {
        [uri]: RA.map(textEdits, (x) => x.textEdit),
      },
    },
    vscodeLSP.CodeActionKind.QuickFix,
  );
  fix.isPreferred = true;
  return fix;
};
