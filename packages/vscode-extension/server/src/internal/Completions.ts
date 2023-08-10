import {
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocuments,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { createIntellisense } from '../language-service/LanguageService';

export async function onCompletion(
  pos: TextDocumentPositionParams,
  documents: TextDocuments<TextDocument>,
): Promise<CompletionItem[]> {
  const service = createIntellisense();
  const range = { start: { line: pos.position.line, character: 0 }, end: pos.position };
  const word = documents.get(pos.textDocument.uri)?.getText(range).split(' ').slice(-1)[0];

  console.log('WORD: ', word);
  return Array.from(service.cache.values()).map((item, index) => {
    return {
      label: item,
      kind: CompletionItemKind.Text,
      data: index + 1,
    };
  });
}

export function onCompletionResolve(item: CompletionItem): CompletionItem {
  return item;
}
