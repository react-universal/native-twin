import * as vscode from 'vscode-languageserver-types';

export const completionRulesToQuickInfo = (
  js: string,
  css: string,
  range: vscode.Range,
): vscode.Hover => {
  return {
    range,
    contents: {
      kind: vscode.MarkupKind.Markdown,
      value: [js, css].join('\n'),
    },
  };
};
