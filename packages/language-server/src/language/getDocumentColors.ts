import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver/node';
import { DocumentsService } from '../documents/documents.service';
import { NativeTwinManagerService } from '../native-twin/native-twin.models';
import { getDocumentTemplatesColors } from './utils/completion.pipes';

export const getDocumentColors = (
  params: vscode.DocumentColorParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.ColorInformation[]> | undefined,
): Effect.Effect<
  vscode.ColorInformation[],
  never,
  NativeTwinManagerService | DocumentsService
> => {
  return Effect.gen(function* () {
    const twinService = yield* NativeTwinManagerService;
    const documentsHandler = yield* DocumentsService;

    return Option.Do.pipe(
      Option.bind('document', () => documentsHandler.getDocument(params.textDocument)),
      Option.let('templates', (x) => x.document.getAllTemplates()),
      Option.map(({ templates, document }) =>
        getDocumentTemplatesColors(templates, twinService, document),
      ),

      Option.match({
        onSome: (result): vscode.ColorInformation[] => result,
        onNone: () => [],
      }),
    );
  });
};
