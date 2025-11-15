import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import type * as vscode from 'vscode-languageserver';
import { TwinLSPDocumentContext } from '../documents/LSPDocuments.service.js';
import { NativeTwinManagerService } from '../services/NativeTwinManager.service.js';
import { getDocumentTemplatesColors } from '../utils/language/colorInfo.utils.js';

export const getDocumentColors = Effect.fn(function* (
  params: vscode.DocumentColorParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.ColorInformation[]> | undefined,
) {
  const documentsHandler = yield* TwinLSPDocumentContext;
  const twinService = yield* NativeTwinManagerService;
  const document = yield* documentsHandler.getDocument(params.textDocument.uri);
  if (document._tag === 'None') return [];

  const languageRegions = yield* documentsHandler.getLanguageRegions(document.value);

  return Option.map(document, (x) =>
    getDocumentTemplatesColors(twinService, x, languageRegions),
  ).pipe(
    Option.match({
      onSome: (result): vscode.ColorInformation[] => result,
      onNone: () => [],
    }),
  );
});
