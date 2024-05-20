import { TextDocument } from 'vscode-languageserver-textdocument';
import * as vscode from 'vscode-languageserver-types';
import { DocumentLanguageRegion } from '../document.resource';

export const documentLanguageRegionToRange = (
  x: DocumentLanguageRegion,
  document: TextDocument,
) => {
  const range = vscode.Range.create(
    document.positionAt(x.offset.start),
    document.positionAt(x.offset.end),
  );
  return {
    range,
    text: document.getText(range),
  };
};
