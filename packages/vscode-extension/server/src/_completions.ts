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

export function _onCompletionResolved(item: CompletionItem): CompletionItem {
  serverConnection.client.connection.console.log('CONTENT: ' + item.label);
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
  cancelToken: CancellationToken,
  workDone: WorkDoneProgressReporter,
  resultProgress?: ResultProgressReporter<CompletionItem[]>,
): CompletionItem[] {
  const document = documents.handler.get(params.textDocument.uri);
  const content = document?.getText();
  serverConnection.console.log('CONTENT: ' + content);
  // The pass parameter contains the position of the text document in
  // which code complete got requested. For the example we ignore this
  // info and always provide the same completion items.
  return [
    {
      label: 'TypeScript asdfsdfsdfsdf',
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
