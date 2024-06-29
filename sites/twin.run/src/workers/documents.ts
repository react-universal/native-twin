import * as vscode from 'vscode-languageserver/browser.js';
import { TextDocument } from 'vscode-languageserver-textdocument';

export const documentsHandler = new vscode.TextDocuments(TextDocument);
