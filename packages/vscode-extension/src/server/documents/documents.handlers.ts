import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocuments } from 'vscode-languageserver/node';

// Create a simple text document manager.
const documentsManager: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
