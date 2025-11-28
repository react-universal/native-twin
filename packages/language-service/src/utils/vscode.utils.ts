import type * as vscode from 'vscode-languageserver-types';

export const isSameRange = (range1: vscode.Range, range2: vscode.Range) => {
  if (range1 === range2) return true;
  return (
    range1.start.line === range2.start.line &&
    range1.start.character === range2.start.character &&
    range1.end.line === range2.end.line &&
    range1.end.character === range2.end.character
  );
};
