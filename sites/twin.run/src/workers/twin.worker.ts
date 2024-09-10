/// <reference lib="WebWorker" />
import {
  BrowserMessageReader,
  BrowserMessageWriter,
  CompletionItemKind,
  TextDocumentSyncKind,
  createConnection,
  TextDocuments,
} from 'vscode-languageserver/browser.js';
// import * as Option from 'effect/Option';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { getDocumentLanguageLocations } from '@native-twin/language-service/build/documents/utils/document.ast';
// import * as monaco from 'monaco-editor';

export const documentsHandler = new TextDocuments(TextDocument);
// const documentsHandler = new DocumentsService(_documentsHandler, {
//   attributes: ['css'],
//   tags: ['css'],
// });
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
  // console.log('PATH: ', new URL(x.textDocument.uri, import.meta.url));
  const document__ = documentsHandler.get(x.textDocument.uri);
  console.log('DOC: ', document__);
  if (document__) {
    const locs = getDocumentLanguageLocations(document__.getText(), {
      attributes: [],
      tags: ['css'],
    });
    console.log('LOCS: ', locs);
  }
  // const document = documentsHandler.getDocument(x.textDocument);
  // const regions = document.pipe(
  //   Option.map((x) => x.getLanguageRegions()),
  //   Option.getOrElse(() => []),
  // );

  // console.log(
  //   'DOC: ',
  //   document.pipe(
  //     Option.map((x) => x.getText()),
  //     Option.getOrElse(() => ''),
  //   ),
  // );
  // console.log('REGIONS: ', regions);
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
// documentsHandler.setupConnection(connection);
documentsHandler.listen(connection);
connection.listen();
