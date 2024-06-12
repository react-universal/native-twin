import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver-types';
import type { TwinDocument } from '../models/twin-document.model';
import { DocumentsService } from '../documents.service';
import type { DocumentLanguageRegion } from '../models/language-region.model';

export const documentLanguageRegionToRange = (
  x: DocumentLanguageRegion,
  document: TwinDocument,
) => {
  const range = vscode.Range.create(
    document.offsetToPosition(x.offset.start),
    document.offsetToPosition(x.offset.end),
  );
  return {
    range,
    text: document.getText(range),
  };
};

export const extractDocumentAndRegions = (params: vscode.TextDocumentIdentifier) =>
  Effect.gen(function* () {
    const documentsHandler = yield* DocumentsService;

    return Option.Do.pipe(
      Option.bind('document', () => documentsHandler.getDocument(params)),
      Option.let('regions', ({ document }) => document.getLanguageRegions()),
    );
  });
