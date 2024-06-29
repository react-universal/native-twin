/// <reference lib="WebWorker" />
import {
  BrowserMessageReader,
  BrowserMessageWriter,
  CompletionItemKind,
  TextDocumentSyncKind,
  createConnection,
  TextDocuments,
} from 'vscode-languageserver/browser.js';
import { TextDocument } from 'vscode-languageserver-textdocument';
// import * as monaco from 'monaco-editor';

export const documentsHandler = new TextDocuments(TextDocument);

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
console.log('SELF: ', self);
connection.onCompletion(async (x) => {
  // console.log('DOCUMENT: ', documentsHandler.get(x.textDocument.uri));
  // console.log('WORKER_connection.onCompletion', x);
  // const doc = documentsHandler.get(x.textDocument.uri);
  // const ts = await monaco.languages.typescript.getTypeScriptWorker();
  // const client = ts(monaco.Uri.file(x.textDocument.uri));
  // console.log('CLIENT: ', client);
  console.log('PATH: ', new URL(x.textDocument.uri, import.meta.url));
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
