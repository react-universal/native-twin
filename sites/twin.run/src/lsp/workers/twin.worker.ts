/// <reference lib="WebWorker" />
import {
  BrowserMessageReader,
  BrowserMessageWriter,
  createConnection,
  TextDocuments,
} from 'vscode-languageserver/browser.js';
import * as Layer from 'effect/Layer';
import * as Effect from 'effect/Effect';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { NativeTwinManagerService } from '@native-twin/language-service/browser';
import {
  ConnectionService,
  ConfigManagerService,
  initializeConnection,
} from '@native-twin/language-service/connection';
import {
  createDocumentsLayer,
  DocumentsService,
} from '@native-twin/language-service/documents';
import {
  createLanguageService,
  LanguageServiceLive,
} from '@native-twin/language-service/language';

const pluginConfig = {
  attributes: [],
  tags: ['css'],
};

const messageReader = new BrowserMessageReader(self as DedicatedWorkerGlobalScope);
const messageWriter = new BrowserMessageWriter(self as DedicatedWorkerGlobalScope);

// Inject the shared services and language-specific services
const connection = createConnection(messageReader, messageWriter);
// Start the language server with the shared services

export const documentsHandler = new TextDocuments(TextDocument);

const ConnectionLayer = ConnectionService.make(connection);
const DocumentsLayer = createDocumentsLayer(pluginConfig, documentsHandler);
const MainLive = Layer.mergeAll(ConnectionLayer, LanguageServiceLive).pipe(
  Layer.provideMerge(DocumentsLayer),
  Layer.provideMerge(NativeTwinManagerService.Live),
  Layer.provideMerge(ConfigManagerService.Live),
);

const program = Effect.gen(function* () {
  const connectionService = yield* ConnectionService;
  const Connection = connectionService;
  const configService = yield* ConfigManagerService;
  const documentService = yield* DocumentsService;
  const nativeTwinManager = yield* NativeTwinManagerService;
  const languageService = yield* createLanguageService;

  Connection.onInitialize(async (...args) => {
    const init = initializeConnection(...args, nativeTwinManager, configService);
    console.log('INIT: ', init);
    return init;
  });

  Connection.onCompletion(async (...args) => {
    const completions = await Effect.runPromise(
      languageService.completions.getCompletionsAtPosition(...args),
    );

    return {
      isIncomplete: true,
      items: completions,
    };
  });

  Connection.onCompletionResolve(async (...args) =>
    Effect.runPromise(
      languageService.completions
        .getCompletionEntryDetails(...args)
        .pipe(Effect.tap((x) => Effect.log(x))),
    ),
  );

  Connection.onHover(async (...args) =>
    Effect.runPromise(languageService.documentation.getHover(...args)),
  );

  Connection.onDocumentColor(async (...params) =>
    Effect.runPromise(languageService.documentation.getDocumentColors(...params)),
  );

  Connection.languages.diagnostics.on(async (...args) =>
    Effect.runPromise(languageService.diagnostics.getDocumentDiagnostics(...args)),
  );

  // documentService.handler.listen(Connection);
});

const runnable = Effect.provide(program, MainLive);

Effect.runFork(runnable);

// connection.onInitialize(() => {
//   return {
//     capabilities: {
//       textDocumentSync: TextDocumentSyncKind.Incremental,

//       completionProvider: {
//         resolveProvider: true,
//         completionItem: {
//           labelDetailsSupport: true,
//         },
//         triggerCharacters: ['`'],
//       },
//       workspace: {
//         workspaceFolders: {
//           supported: true,
//         },
//       },
//       documentHighlightProvider: false,
//       workspaceSymbolProvider: {
//         resolveProvider: true,
//       },
//       // colorProvider: true,
//     },
//   };
// });

// connection.onInitialized((x) => {
//   console.log('WORKER_connection.onInitialized', x);
// });
// console.log('SELF: ', self);
// connection.onCompletion(async (x) => {
//   // console.log('PATH: ', new URL(x.textDocument.uri, import.meta.url));
//   const document__ = documentsHandler.get(x.textDocument.uri);
//   console.log('DOC: ', document__);
//   if (document__) {
//     const locs = getDocumentLanguageLocations(document__.getText(), {
//       attributes: [],
//       tags: ['css'],
//     });
//     console.log('LOCS: ', locs);
//   }
//   // const document = documentsHandler.getDocument(x.textDocument);
//   // const regions = document.pipe(
//   //   Option.map((x) => x.getLanguageRegions()),
//   //   Option.getOrElse(() => []),
//   // );

//   // console.log(
//   //   'DOC: ',
//   //   document.pipe(
//   //     Option.map((x) => x.getText()),
//   //     Option.getOrElse(() => ''),
//   //   ),
//   // );
//   // console.log('REGIONS: ', regions);
//   return [
//     {
//       label: 'asd',
//       kind: CompletionItemKind.Color,
//     },
//   ];
// });
// connection.onCompletionResolve((x) => {
//   return x;
// });
// documentsHandler.setupConnection(connection);
documentsHandler.listen(connection);
connection.listen();
