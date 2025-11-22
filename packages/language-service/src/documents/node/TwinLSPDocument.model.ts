import type * as VSCDocument from 'vscode-languageserver-textdocument';
import { BaseTwinTextDocument } from '../common/BaseTwinDocument.js';

export class TwinLSPDocument extends BaseTwinTextDocument {
  constructor(textDocument: VSCDocument.TextDocument) {
    super(textDocument);
  }
}
