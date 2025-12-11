/// <reference lib="WebWorker" />

import { sheetEntriesToCss } from '@native-twin/css';
import {
  getClientCapabilities,
  LSPAdapterSpec,
  LSPBaseLayerLive,
  LSPConfig,
  LSPContext,
  languagePrograms,
  TwinParserContext,
  TwinRuntimeContext,
} from '@native-twin/language-service/browser';
import * as Array from 'effect/Array';
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

const Runtime = ManagedRuntime.make(LspMainLive);

const program = Effect.gen(function* () {
  const lsp = yield* LSPContext;
  const config = yield* LSPConfig;

  lsp.connection.onCompletion(async (params) => {
    const completions = await Runtime.runPromise(
      languagePrograms.getCompletionsAtPosition
        .apply(params.textDocument.uri, params.position)
        .pipe(Effect.catchAll((error) => Effect.log('CompletionsError: ', error))),
    );
    if (!completions) return undefined;

    return completions;
  });

  lsp.connection.onInitialize(async (params) => {
    const capabilities = getClientCapabilities(params.capabilities);
    const configOptions = params.initializationOptions;

    await Runtime.runPromise(config.onChangeConfig(configOptions));

    return capabilities;
  });

  lsp.connection.onDidChangeConfiguration(async (changes) => {
    await config.config.pipe(
      Effect.andThen((currentConfig) =>
        config
          .onChangeConfig((changes.settings?.['nativeTwin'] as any) ?? currentConfig)
          .pipe(
            Effect.andThen(() =>
              currentConfig.diagnostics === 'off'
                ? lsp.connection.languages.diagnostics.refresh()
                : Effect.void,
            ),
          ),
      ),
      Effect.runPromise,
    );
  });

  lsp.connection.onRequest('get.css', async (documentUri: string) => {
    console.log('GET_CSS', documentUri);
    return Effect.gen(function* () {
      const twin = yield* TwinRuntimeContext;

      const { getLSPDocument } = yield* LSPAdapterSpec;
      const parser = yield* TwinParserContext;
      const document = yield* getLSPDocument(documentUri);
      const twinTarget = yield* twin.twinRef.get;

      const docRegions = document.regions
        .flatMap((x) => x.styledProps)
        .map((x) => x.attributeValue);

      const sheetEntries = yield* Effect.all(docRegions.map((x) => parser.runTW(x.text))).pipe(
        Effect.map(Array.flatten),
      );
      const css = sheetEntriesToCss(
        Array.dedupeWith(
          [...twinTarget.target, ...sheetEntries],
          (self, that) => self.className === that.className,
        ),
      );
      console.log('ENTRIES; ', sheetEntries);
      return { css, regions: docRegions };
    }).pipe(
      Effect.catchAll((error) =>
        Effect.log('get.css error: ', error).pipe(Effect.andThen(() => '.a {}')),
      ),
      Runtime.runPromise,
    );
  });
  lsp.connection.onDocumentHighlight(async (...args) => {
    const data = await languagePrograms
      .getDocumentHighLightsProgram(...args)
      .pipe(Runtime.runPromise);
    return data;
  });

  lsp.connection.onCodeAction(() => undefined);

  lsp.connection.onCompletionResolve(async (...args) =>
    Runtime.runPromise(languagePrograms.getCompletionEntryDetails(...args)),
  );

  lsp.connection.onHover(async (...args) =>
    Runtime.runPromise(languagePrograms.getHoverDetails(...args)),
  );

  lsp.connection.onDocumentColor(async (...params) =>
    Runtime.runPromise(languagePrograms.getDocumentColors(...params)),
  );

  lsp.connection.languages.diagnostics.on(async (...args) =>
    Runtime.runPromise(languagePrograms.getDocumentDiagnosticsProgram(...args)),
  );

  documentsHandler.listen(connectionHandler);
  connectionHandler.listen();
}).pipe(Effect.onError((error) => Effect.log('ERROR ON LAYER CREATION: ', error)));

const runnable = Effect.provide(program, LspMainLive);

Effect.runPromise(runnable);
