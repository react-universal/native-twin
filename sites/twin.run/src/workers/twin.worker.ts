/// <reference lib="WebWorker" />
import {
  BrowserMessageReader,
  BrowserMessageWriter,
  CompletionItemKind,
  TextDocumentSyncKind,
  createConnection,
} from 'vscode-languageserver/browser.js';
import { documentsHandler } from './documents.js';

/* browser specific setup code */
const messageReader = new BrowserMessageReader(self as DedicatedWorkerGlobalScope);
const messageWriter = new BrowserMessageWriter(self as DedicatedWorkerGlobalScope);

// Inject the shared services and language-specific services
const connection = createConnection(messageReader, messageWriter);

// Start the language server with the shared services
connection.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,

      completionProvider: {
        resolveProvider: true,
        completionItem: {
          labelDetailsSupport: true,
        },
        triggerCharacters: ['`'],
      },
      workspace: {
        workspaceFolders: {
          supported: true,
        },
      },
      documentHighlightProvider: false,
      workspaceSymbolProvider: {
        resolveProvider: true,
      },
      // colorProvider: true,
    },
  };
});

connection.onInitialized((x) => {
  console.log('WORKER_connection.onInitialized', x);
});
connection.onCompletion((x) => {
  console.log('WORKER_connection.onCompletion', x);
  const doc = documentsHandler.get(x.textDocument.uri);
  console.log('DOC: ', doc);
  console.log('HANDLER: ', documentsHandler);
  return [
    {
      label: 'asd',
      kind: CompletionItemKind.Color,
    },
  ];
});
connection.onCompletionResolve((x) => {
  return x;
});

documentsHandler.listen(connection);
connection.listen();
