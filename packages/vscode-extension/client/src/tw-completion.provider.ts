import * as vscode from 'vscode';

export class NativeStyledCompletionItemProvider implements vscode.CompletionItemProvider {
  resolveCompletionItem(
    item: vscode.CompletionItem,
    _token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.CompletionItem> {
    return item;
  }
  public async provideCompletionItems(
    _document: vscode.TextDocument,
    _position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext,
  ): Promise<vscode.CompletionItem[]> {
    const completionItems: vscode.CompletionItem[] = [];

    return completionItems;
  }
}
