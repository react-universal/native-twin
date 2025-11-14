/// <reference lib="WebWorker" />

import { TwinParserContextLive } from '@native-twin/language-service';
import {
  LSPConfigService,
  LSPConnectionService,
  LSPDocumentsService,
  languagePrograms,
  MonacoNativeTwinManager,
  NativeTwinManagerService,
  TwinMonacoTextDocument,
} from '@native-twin/language-service/browser';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import {
  BrowserMessageReader,
  BrowserMessageWriter,
  createConnection,
  TextDocuments,
} from 'vscode-languageserver/browser';
import { TextDocument } from 'vscode-languageserver-textdocument';

const messageReader = new BrowserMessageReader(self as DedicatedWorkerGlobalScope);
const messageWriter = new BrowserMessageWriter(self as DedicatedWorkerGlobalScope);
const connection = createConnection(messageReader, messageWriter);
const documentsHandler = new TextDocuments(TextDocument);

const ConnectionLayer = LSPConnectionService.make(connection);
const DocumentsLayer = LSPDocumentsService.make(documentsHandler, TwinMonacoTextDocument);

const MainLive = Layer.empty.pipe(
  Layer.provideMerge(DocumentsLayer),
  Layer.provideMerge(TwinParserContextLive),
  Layer.provideMerge(LSPConfigService.Live),
  Layer.provideMerge(Layer.succeed(NativeTwinManagerService, new MonacoNativeTwinManager())),
  Layer.provideMerge(ConnectionLayer),
  // Layer.provideMerge(ConfigManagerService.Live),
);

const program = Effect.gen(function* () {
  const connectionService = yield* LSPConnectionService;
  const Connection = connectionService;
  yield* LSPDocumentsService;
  yield* LSPConfigService;
  const Runtime = ManagedRuntime.make(MainLive);

  Connection.onCompletion(async (...args) => {
    const completions = await Runtime.runPromise(
      languagePrograms.getCompletionsAtPosition(...args),
    );

    return {
      isIncomplete: completions.length > 0,
      items: completions,
    };
  });

  Connection.onCompletionResolve(async (...args) =>
    Runtime.runPromise(languagePrograms.getCompletionEntryDetails(...args)),
  );

  Connection.onHover(async (...args) =>
    Runtime.runPromise(languagePrograms.getHoverDetails(...args)),
  );

  Connection.onDocumentColor(async (...params) =>
    Runtime.runPromise(languagePrograms.getDocumentColors(...params)),
  );

  Connection.languages.diagnostics.on(async (...args) =>
    Runtime.runPromise(languagePrograms.getDocumentDiagnosticsProgram(...args)),
  );
});

const runnable = Effect.provide(program, MainLive);

Effect.runFork(runnable);

documentsHandler.listen(connection);
connection.listen();
