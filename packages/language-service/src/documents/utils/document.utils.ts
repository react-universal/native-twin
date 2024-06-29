import * as vscode from 'vscode-languageserver-types';
import type { TwinDocument } from '../models/twin-document.model';
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
