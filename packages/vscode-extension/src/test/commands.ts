import * as vscode from 'vscode';

export const executeCompletionAtPosition = async (
  docUri: vscode.Uri,
  position: vscode.Position,
): Promise<vscode.CompletionList> => {
  const result: vscode.CompletionList = await vscode.commands.executeCommand(
    'vscode.executeCompletionItemProvider',
    docUri,
    position,
  );
  return result;
};
