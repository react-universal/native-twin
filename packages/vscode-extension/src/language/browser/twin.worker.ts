/// <reference lib="WebWorker" />

import {
  FileNotFound,
  getClientCapabilities,
  JSXParser,
  LSPAdapterSpec,
  LSPBaseLayerLive,
  LSPConfig,
  LSPContext,
  type LSPPosition,
  languagePrograms,
  parseLSPConfigInput,
  type TwinConfigOptions,
  TwinLSPDocument,
  TypeScriptProgram,
} from '@native-twin/language-service/browser';
import * as Effect from 'effect/Effect';
import * as Fiber from 'effect/Fiber';
import { identity } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import * as Option from 'effect/Option';
import * as Ref from 'effect/Ref';
import * as Stream from 'effect/Stream';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import ts from 'ts-morph';
import type * as t from 'vscode-languageserver';
import {
  BrowserMessageReader,
  BrowserMessageWriter,
  createConnection,
  TextDocuments,
} from 'vscode-languageserver/browser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import defaultConfig from '../../twinConfig.default';

const messageReader = new BrowserMessageReader(self as DedicatedWorkerGlobalScope);
const messageWriter = new BrowserMessageWriter(self as DedicatedWorkerGlobalScope);
const connection = createConnection(messageReader, messageWriter);
const documentsHandler = new TextDocuments(TextDocument);

documentsHandler.listen(connection);
connection.listen();
connection.onExit(() => {
  self.console.log('0asdasdasdad');
});

messageReader.listen((x) => console.log('MESSAGE: ', x));
const LSPContextLive = Effect.gen(function* () {
  const documentChanges = Stream.async<TextDocument>((emit) => {
    documentsHandler.onDidChangeContent((changes) => {
      emit.single(changes.document);
    });
    return Effect.void;
  });

  return LSPContext.of({
    connection,
    documentChanges,
    documents: documentsHandler,
    getAllDocuments: () => documentsHandler.all(),
    getDocument: (uri) => Option.fromNullable(documentsHandler.get(uri)),
  });
}).pipe(Layer.effect(LSPContext));

const LSPConfigLive = Effect.gen(function* () {
  const configRef = yield* SubscriptionRef.make(parseLSPConfigInput({}));

  const configSelector = <T>(selector: (config: TwinConfigOptions) => T) =>
    configRef.get.pipe(Effect.map((x) => selector(x)));

  const onChangeConfig = (newConfig: TwinConfigOptions) =>
    SubscriptionRef.setAndGet(configRef, newConfig).pipe(
      Effect.tap(() => Effect.log('LSPConfig changed.')),
    );

  return LSPConfig.of({
    config: configRef,
    configSelector,
    onChangeConfig,
    loadTwinConfig: (_filename) => Effect.succeed(Option.some(defaultConfig)),
  });
}).pipe(Layer.effect(LSPConfig));

export const TypescriptContextLive = Effect.gen(function* () {
  const lspConfig = yield* LSPConfig;
  const compilerOptions = ts.ts.getDefaultCompilerOptions();
  const project = new ts.Project({
    compilerOptions: compilerOptions,
    useInMemoryFileSystem: true,
  });
  const programRef = yield* Ref.make<ts.Program>(project.getProgram());

  const fiber = yield* lspConfig.config.changes.pipe(
    Stream.forever,
    Stream.runForEach(
      Effect.fn(function* () {
        yield* Effect.log('updating ts layers');
        // yield* getCompilerOptions().pipe(Effect.andThen((x) => Ref.set(compilerOptionsRef, x)));
        yield* Ref.set(programRef, project.getProgram());
      }),
    ),
    Effect.fork,
  );

  Effect.addFinalizer(() => Fiber.interrupt(fiber));

  project.enableLogging(true);
  const getSourceFile = Effect.fn(function* (filename: string, content: string) {
    return yield* Effect.succeed(
      project.createSourceFile(filename, content, {
        overwrite: true,
        scriptKind: ts.ScriptKind.TSX,
      }),
    );
  });

  return TypeScriptProgram.of({
    getSourceFile,
    project,
  });
}).pipe(Layer.effect(TypeScriptProgram));

const AdapterLive = Effect.gen(function* () {
  const { getDocument } = yield* LSPContext;
  const program = yield* TypeScriptProgram;
  const parser = yield* JSXParser;

  const getLSPDocument = Effect.fn(function* (filename: string) {
    const document = yield* Effect.succeed(getDocument(filename))
      .pipe(Effect.flatMap(identity))
      .pipe(Effect.mapError((e) => FileNotFound.create(e)));

    const filePath = filename;
    const tsSource = yield* program.getSourceFile(filePath, document.getText());
    const regions = parser.jsxNodesToRegions(parser.getJSXRootsFromSource(tsSource), document);

    return new TwinLSPDocument(document, regions);
  });

  const getRegions = Effect.fn('vscodeAdapter: extractRegions')(function* (filename: string) {
    const document = yield* getLSPDocument(filename);
    return document.regions;
  });

  const getRegionAt = Effect.fn('vscodeAdapter: getTokenAtPosition')(function* (
    filename: string,
    position: LSPPosition,
  ) {
    const document = yield* getLSPDocument(filename);

    return document.findRegionAt(position);
  });

  return LSPAdapterSpec.of({
    getLSPDocument,
    getRegionAt,
    getRegions,
  });
}).pipe(Layer.effect(LSPAdapterSpec));

const MainLayer = Layer.empty.pipe(
  Layer.provideMerge(AdapterLive),
  Layer.provideMerge(TypescriptContextLive),
  Layer.provideMerge(LSPContextLive),
  Layer.provideMerge(LSPBaseLayerLive),
  Layer.provideMerge(LSPConfigLive),
);

const runtime = ManagedRuntime.make(MainLayer);

const program = Effect.gen(function* () {
  yield* Effect.log('START_SERVER');
  // const { connection } = yield* LSPContext;
  const { config, onChangeConfig, configSelector } = yield* LSPConfig;

  connection.onInitialize(async (params) => {
    console.log('connection.onInitialize', params);
    const capabilities = getClientCapabilities(params.capabilities);
    const configOptions = params.initializationOptions;

    await runtime.runPromise(onChangeConfig(configOptions));

    console.log('CAPABILITIES: ', { capabilities, configOptions });
    return capabilities;
  });

  connection.onDidChangeConfiguration(async (changes) => {
    console.warn('connection.onDidChangeConfiguration, ', changes);
    const result = await config.pipe(
      Effect.andThen((currentConfig) =>
        onChangeConfig((changes.settings?.['nativeTwin'] as any) ?? currentConfig).pipe(
          Effect.andThen(() =>
            currentConfig.diagnostics === 'off'
              ? connection.languages.diagnostics.refresh()
              : Effect.void,
          ),
        ),
      ),
      Effect.runPromiseExit,
    );

    console.log('RESULT: ', result);
  });

  connection.onCompletionResolve(async (...args) =>
    languagePrograms.getCompletionEntryDetails(...args).pipe(runtime.runPromise),
  );

  connection.onHover(async (...args) =>
    languagePrograms.getHoverDetails(...args).pipe(runtime.runPromise),
  );

  connection.languages.diagnostics.on(async (...args) => {
    return Effect.andThen(
      configSelector((x) => x),
      (x) =>
        x.diagnostics === 'off'
          ? Effect.succeed<t.DocumentDiagnosticReport>({ kind: 'full', items: [] })
          : languagePrograms.getDocumentDiagnosticsProgram(...args),
    ).pipe(runtime.runPromise);
  });

  connection.onDocumentColor(async (...params) =>
    languagePrograms.getDocumentColors(...params).pipe(runtime.runPromise),
  );

  connection.onDocumentHighlight(async (...args) => {
    const data = await languagePrograms
      .getDocumentHighLightsProgram(...args)
      .pipe(runtime.runPromise);
    return data;
  });

  connection.onCompletion(async (params) => {
    const result = await languagePrograms.getCompletionsAtPosition
      .apply(params.textDocument.uri, params.position)
      .pipe(
        Effect.map((completions) => completions),
        Effect.provide(MainLayer),
        runtime.runPromise,
      );

    return result;
  });

  connection.onSelectionRanges(async (_params, _token, _, __) => {
    return [];
  });

  connection.onCodeAction(async (params, _token, _workDone) =>
    languagePrograms.twinCodeActionsProgram(params).pipe(runtime.runPromise),
  );

  connection.onCodeActionResolve(async (params) => {
    // console.log('PARAMS: ', params);
    return {
      ...params,
    };
  });

  console.log('CONNECTION_LISTEN: ', connection);

  connection.onShutdown(() => {
    connection.console.log('shootDown');
  });
});

runtime.runFork(program);
// BrowserRuntime.runMain(program.pipe(Effect.provide(MainLayer)));

documentsHandler.listen(connection);
connection.listen();
