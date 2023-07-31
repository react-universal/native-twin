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

serverConnection.listen();

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.handler.listen(serverConnection);
