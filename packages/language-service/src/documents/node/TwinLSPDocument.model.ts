import type * as VSCDocument from 'vscode-languageserver-textdocument';
import type { NativeTwinPluginConfiguration } from '../../utils/constants.utils.js';
import { BaseTwinTextDocument } from '../common/BaseTwinDocument.js';

export class TwinLSPDocument extends BaseTwinTextDocument {
  constructor(textDocument: VSCDocument.TextDocument, config: NativeTwinPluginConfiguration) {
    super(textDocument, config);
  }
}
