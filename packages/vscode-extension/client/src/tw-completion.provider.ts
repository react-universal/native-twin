import * as vscode from 'vscode';
import { getStartLineToCursorText } from './utils/position.utils';

export class NativeStyledCompletionItemProvider implements vscode.CompletionItemProvider {
  resolveCompletionItem(
    item: vscode.CompletionItem,
    _token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.CompletionItem> {
    return item;
  }
  public async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext,
  ): Promise<vscode.CompletionItem[]> {
    const nextCharacterPosition = position.with({
      character: position.character + 1,
    });

    const prevCharacterPosition = position.with({
      character: position.character - 1,
    });
    // @ts-ignore
    const prefix = getStartLineToCursorText(position, document);
    const rangeNext = new vscode.Range(position, nextCharacterPosition);
    const rangePrev = new vscode.Range(position, prevCharacterPosition);
    // @ts-ignore
    const currentChar = document.getText(rangeNext);
    // @ts-ignore
    const getWordRangeAtPosition = document.getText(document.getWordRangeAtPosition(position));
    // @ts-ignore
    const isPrevSpace = document.getText(rangePrev) == ' ';

    const completionItems: vscode.CompletionItem[] = [];

    return completionItems;
  }
}
