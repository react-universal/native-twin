import { serverConnection } from './_connection-manager';
import { documents } from './_document-provider';
import { _onCompletion, _onCompletionResolved } from './_completions';

// Cache the settings of all open documents

serverConnection.onDidChangeWatchedFiles((_change) => {
  // Monitored files have change in VSCode
  serverConnection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
serverConnection.onCompletion(_onCompletion);

// This handler resolves additional information for the item selected in
// the completion list.
serverConnection.onCompletionResolve(_onCompletionResolved);

serverConnection.onDidChangeTextDocument((handler) => {
  serverConnection.console.log(`${handler.textDocument.uri} changed`);
  return documents.handler.get(handler.textDocument.uri);
});

// Only keep settings for open documents
documents.handler.onDidClose((e) => {
  documents.documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
// documents.handler.onDidChangeContent((change) => {
//   serverConnection.console.log(`${change.document.getText()} changed`);
//   documents.documentSettings.delete(change.document.uri);
// });

// serverConnection.workspace.connection.onDidChangeTextDocument((handler) => {
//   serverConnection.console.log(`${handler.textDocument.uri} changed CONNN`);
//   return documents.handler.get(handler.textDocument.uri);
// });

serverConnection.listen();

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.handler.listen(serverConnection);
