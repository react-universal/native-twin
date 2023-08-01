import * as vscode from 'vscode';

export function getTextFromPosition(position: vscode.Position, document: vscode.TextDocument) {
  const range = new vscode.Range(
    position,
    position.with({
      character: position.character - 1,
    }),
  );
  return document.getText(range);
}

export function getStartLineToCursorText(
  position: vscode.Position,
  document: vscode.TextDocument,
) {
  return document.lineAt(position).text.slice(0, position.character);
}
