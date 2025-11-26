import * as vscode from 'vscode-languageserver-types';
import { getDocumentationMarkdown } from './language.utils.js';

export const createCompletionEntryDetails = (
  completion: vscode.CompletionItem,
  css: string,
  sheetEntry: Record<string, any>,
): vscode.CompletionItem => ({
  ...completion,
  documentation: {
    kind: vscode.MarkupKind.Markdown,
    value: getDocumentationMarkdown(sheetEntry, css),
  },
});
