import type { SheetEntry } from '@native-twin/css';
import * as vscode from 'vscode-languageserver-types';
import { getDocumentationMarkdown } from './language.utils.js';

export const completionRulesToQuickInfo = (
  sheetEntry: SheetEntry[],
  css: string,
  range: vscode.Range,
): vscode.Hover => {
  return completionRuleToQuickInfo(sheetEntry, css, range);
};

export const completionRuleToQuickInfo = (
  sheetEntry: Record<string, any>,
  css: string,
  range: vscode.Range,
): vscode.Hover => ({
  range,
  contents: {
    kind: vscode.MarkupKind.Markdown,
    value: getDocumentationMarkdown(sheetEntry, css),
  },
});
