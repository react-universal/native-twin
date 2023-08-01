import {
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  CancellationToken,
  WorkDoneProgressReporter,
  ResultProgressReporter,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { documents } from './_document-provider';
import { serverConnection } from './_connection-manager';

export function _onCompletionResolved(
  item: CompletionItem,
  _token: CancellationToken,
): CompletionItem {
  if (item.data === 1) {
    item.detail = 'TypeScript details';
    item.documentation = 'TypeScript documentation';
  } else if (item.data === 2) {
    item.detail = 'JavaScript details';
    item.documentation = 'JavaScript documentation';
  }
  return item;
}

export function _onCompletion(
  params: TextDocumentPositionParams,
  _cancelToken: CancellationToken,
  _workDone: WorkDoneProgressReporter,
  _resultProgress?: ResultProgressReporter<CompletionItem[]>,
): CompletionItem[] {
  const document = documents.handler.get(params.textDocument.uri);
  const content = document?.getText({
    start: { character: params.position.character, line: params.position.line },
    end: { character: 0, line: params.position.line },
  });
  serverConnection.console.log('CONTENT: ' + content);
  // The pass parameter contains the position of the text document in
  // which code complete got requested. For the example we ignore this
  // info and always provide the same completion items.
  return [
    {
      label: 'TypeScript',
      kind: CompletionItemKind.Text,
      data: 1,
    },
    {
      label: 'JavaScript',
      kind: CompletionItemKind.Text,
      data: 2,
    },
  ];
}

export function getTailwindCompletion(_textDocument: TextDocument) {
  return null;
}
