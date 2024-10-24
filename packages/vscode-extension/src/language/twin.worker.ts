/* eslint-disable @typescript-eslint/no-empty-function */
/// <reference lib="WebWorker" />
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  BrowserMessageReader,
  BrowserMessageWriter,
  createConnection,
  TextDocuments,
} from 'vscode-languageserver/browser.js';
import {
  NativeTwinManagerService,
  createDocumentsLayer,
  DocumentsService,
  createLanguageService,
  LanguageServiceLive,
  Constants,
  ConnectionService,
  ConfigManagerService,
  initializeConnection,
} from '@native-twin/language-service/browser';

const pluginConfig = Constants.DEFAULT_PLUGIN_CONFIG;

const messageReader = new BrowserMessageReader(self as DedicatedWorkerGlobalScope);
const messageWriter = new BrowserMessageWriter(self as DedicatedWorkerGlobalScope);
const connection = createConnection(messageReader, messageWriter);
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
  yield* DocumentsService;
  const nativeTwinManager = yield* NativeTwinManagerService;
  const languageService = yield* createLanguageService;

  Connection.onInitialize(async (...args) => {
    const init = initializeConnection(...args, nativeTwinManager, configService);
    return init;
  });

  Connection.onCompletion(async (...args) => {
    const completions = await Effect.runPromise(
      languageService.completions.getCompletionsAtPosition(...args),
    );
    console.log('COMPLETIONS: ', completions);

    return {
      isIncomplete: completions.length > 0,
      items: completions,
    };
  });

  Connection.onCompletionResolve(async (...args) =>
    Effect.runPromise(languageService.completions.getCompletionEntryDetails(...args)),
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

  // documentsHandler.listen(connection);
  // connection.listen();
});

const runnable = Effect.provide(program, MainLive);

Effect.runFork(runnable);

documentsHandler.listen(connection);
connection.listen();
