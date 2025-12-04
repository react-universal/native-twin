/// <reference lib="WebWorker" />

import {
  getClientCapabilities,
  LSPBaseLayerLive,
  LSPConfig,
  LSPContext,
  languagePrograms,
} from '@native-twin/language-service/browser';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import {
  BrowserMessageReader,
  BrowserMessageWriter,
  createConnection,
  TextDocuments,
} from 'vscode-languageserver/browser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { LSPConfigLive } from '../services/Config.service';
import { TypescriptContextLive } from '../services/Typescript.service';
import { VscodeLSPAdapterLive } from '../services/vscode.adapter';

const messageReader = new BrowserMessageReader(self as DedicatedWorkerGlobalScope);
const messageWriter = new BrowserMessageWriter(self as DedicatedWorkerGlobalScope);
const connectionHandler = createConnection(messageReader, messageWriter);
export const documentsHandler = new TextDocuments(TextDocument);

export const LSPContextLive = Effect.gen(function* () {
  const documents = documentsHandler;
  const documentChanges = Stream.async<TextDocument>((emit) => {
    const subs = documents.onDidChangeContent((doc) => {
      emit.single(doc.document);
    });

    return Effect.sync(() => subs.dispose());
  });
  const getDocument = (uri: string) => Option.fromNullable(documents.get(uri));

  return LSPContext.of({
    documents,
    getAllDocuments: () => documents.all(),
    getDocument: getDocument,
    connection: connectionHandler,
    documentChanges,
  });
}).pipe(Layer.effect(LSPContext));

export const LspMainLive = Layer.empty.pipe(
  Layer.provideMerge(VscodeLSPAdapterLive),
  Layer.provideMerge(TypescriptContextLive),
  Layer.provideMerge(LSPBaseLayerLive),
  Layer.provideMerge(LSPContextLive),
  Layer.provideMerge(LSPConfigLive),
);

const program = Effect.gen(function* () {
  console.log('START_PROGRAM');
  const { connection: Connection } = yield* LSPContext;
  const config = yield* LSPConfig;
  const Runtime = ManagedRuntime.make(LspMainLive);

  Connection.onCompletion(async (params) => {
    const completions = await Runtime.runPromise(
      languagePrograms.getCompletionsAtPosition
        .apply(params.textDocument.uri, params.position)
        .pipe(Effect.catchAll((error) => Effect.log('ERRORRR: ', error))),
    );
    if (!completions) return undefined;

    return completions.completions;
  });

  Connection.onInitialize(async (params) => {
    const capabilities = getClientCapabilities(params.capabilities);
    const configOptions = params.initializationOptions;

    await Runtime.runPromise(config.onChangeConfig(configOptions));

    return capabilities;
  });

  Connection.onDidChangeConfiguration(async (changes) => {
    await config.config.pipe(
      Effect.andThen((currentConfig) =>
        config
          .onChangeConfig((changes.settings?.['nativeTwin'] as any) ?? currentConfig)
          .pipe(
            Effect.andThen(() =>
              currentConfig.diagnostics === 'off'
                ? Connection.languages.diagnostics.refresh()
                : Effect.void,
            ),
          ),
      ),
      Effect.runPromise,
    );
  });

  Connection.onCodeAction(() => undefined);

  Connection.onCompletionResolve(async (...args) =>
    Runtime.runPromise(languagePrograms.getCompletionEntryDetails(...args)),
  );

  Connection.onHover(async (...args) =>
    Runtime.runPromise(languagePrograms.getHoverDetails(...args)),
  );

  Connection.onDocumentColor(async (...params) =>
    Runtime.runPromise(languagePrograms.getDocumentColors(...params)),
  );

  // Connection.languages.diagnostics.on(async (...args) =>
  //   Runtime.runPromise(languagePrograms.getDocumentDiagnosticsProgram(...args)),
  // );

  documentsHandler.listen(connectionHandler);
  connectionHandler.listen();
}).pipe(Effect.onError((error) => Effect.log('ERROR ON LAYER CREATION: ', error)));

const runnable = Effect.provide(program, LspMainLive);

Effect.runPromise(runnable);
