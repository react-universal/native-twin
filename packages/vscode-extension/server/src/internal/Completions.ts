import { TextDocument } from 'vscode-languageserver-textdocument';
import * as vscode from 'vscode-languageserver-types';
import {
  CompletionItem,
  CompletionItemKind,
  type TextDocumentPositionParams,
  TextDocuments,
} from 'vscode-languageserver/node';
import { createIntellisense } from '../language-service/LanguageService';

export async function onCompletion(
  pos: TextDocumentPositionParams,
  documents: TextDocuments<TextDocument>,
): Promise<CompletionItem[]> {
  const service = createIntellisense();
  const range = { start: { line: pos.position.line, character: 0 }, end: pos.position };
  const word = documents.get(pos.textDocument.uri)?.getText(range).split(' ').slice(-1)[0];

  console.log('WORD: ', word);
  return Array.from(service.cache.entries()).map((item, index) => {
    return {
      label: item[1],
      kind: CompletionItemKind.Text,
      data: index + 1,
      documentation: {
        kind: vscode.MarkupKind.Markdown,
        value: ['```css\n' + service.getCss(item[0]).css + '\n```']
          .filter(Boolean)
          .join('\n\n'),
      },
    };
  });
}

export function onCompletionResolve(item: CompletionItem): CompletionItem {
  return item;
}
