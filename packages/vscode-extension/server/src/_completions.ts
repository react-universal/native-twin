import {
  CompletionItem,
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
  return [];
}

export function getTailwindCompletion(_textDocument: TextDocument) {
  return null;
}
