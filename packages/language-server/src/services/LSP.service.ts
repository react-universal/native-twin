import {
  type TwinConfigOptions,
  TwinLSPDocument,
  TypescriptApi,
} from '@native-twin/language-service';
import { vscodeLSPAdapterExecutor } from '@native-twin/language-service/adapters/vscode.adapter.js';
import {
  LSPBaseLayerLive,
  LSPConfig,
  LSPContext,
  parseLSPConfigInput,
} from '@native-twin/language-service/Services';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import ts from 'typescript';
import * as vscode from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { LoggerLive } from './logger.service';

const documentsHandler = new vscode.TextDocuments(TextDocument);
const connectionHandler = vscode.createConnection();

const makeLSPContext = Effect.gen(function* () {
  const documents = documentsHandler;
  const documentChanges = Stream.async<TextDocument>((emit) => {
    const subs = documents.onDidChangeContent((doc) => {
      emit.single(doc.document);
    });

    return Effect.sync(() => subs.dispose());
  });
  const getDocument = (uri: string) => Option.fromNullable(documents.get(uri));
  const documentToTwin = (doc: TextDocument) => Option.some(new TwinLSPDocument(doc));

  return LSPContext.of({
    documents,
    getAllDocuments: () => documents.all(),
    getDocument: Option.composeK(getDocument, documentToTwin),
    executor: {
      getLSPDocument: vscodeLSPAdapterExecutor.getLSPDocument,
      getRegionAt: vscodeLSPAdapterExecutor.getRegionAt,
      getRegions: vscodeLSPAdapterExecutor.getRegions,
    },
    connection: connectionHandler,
    documentChanges,
  });
});

const makeConfig = Effect.gen(function* () {
  const currentConfig = yield* SubscriptionRef.make<TwinConfigOptions>(
    parseLSPConfigInput(yield* getInitialConfig()),
  );

  const onChangeConfig = (newConfig: TwinConfigOptions) =>
    SubscriptionRef.set(currentConfig, newConfig);

  return LSPConfig.of({
    config: currentConfig,
    onChangeConfig,
  });

  function getInitialConfig(): Effect.Effect<Partial<TwinConfigOptions>> {
    const rootDir = process.cwd();
    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
    const initialConfig: Partial<TwinConfigOptions> = { rootDir, tsConfigPath };
    return Stream.fromAsyncIterable(
      glob.iterate(`${rootDir}/{tailwind,twin,nativeTwin,native-twin}.config.{ts,js,mjs,cjs}`, {
        maxDepth: 1,
        absolute: true,
        cwd: rootDir,
        includeChildMatches: false,
        nodir: true,
      }),
      (e) => new Error(`Glob async failed searching for twinConfigPath: ${e}`),
    ).pipe(
      Stream.runHead,
      Effect.map(Option.map((configPath) => Object.assign(initialConfig, { configPath }))),
      Effect.map(Option.getOrElse(() => initialConfig)),
      Effect.catchAll((error) =>
        Effect.logDebug(`Search for twinFile fails with: ${error}`).pipe(
          Effect.andThen(() => initialConfig),
        ),
      ),
    );
  }
});

const makeTS = Effect.gen(function* () {
  const files: ts.MapLike<{ version: number }> = {};
  const lspConfig = yield* LSPConfig;
  const defaultOptions = ts.getDefaultCompilerOptions();
  const compilerOptions: ts.CompilerOptions = yield* lspConfig.config.get.pipe(
    Effect.andThen((config) =>
      Effect.try({
        try: () =>
          ts.readConfigFile(config.tsConfigPath, (path) => fs.readFileSync(path, 'utf-8')).config ??
          defaultOptions,
        catch: () => new Error('asd'),
      }).pipe(Effect.catchAll(() => Effect.succeed(defaultOptions))),
    ),
  );

  const servicesHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => Object.keys(files),
    getScriptVersion: (fileName) => files[fileName] && files[fileName].version.toString(),
    getScriptSnapshot: (fileName) => {
      if (!fs.existsSync(fileName)) return undefined;
      return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString('utf-8'));
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => compilerOptions,
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
  };
  const languageService = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());

  const tsLayer = Layer.succeed(TypescriptApi.TypeScriptApi, ts);
  const program = Layer.succeed(
    TypescriptApi.TypeScriptProgram,
    languageService.getProgram() ?? getDefaultProgram(files, compilerOptions, servicesHost),
  );
  return Layer.merge(tsLayer, program);
}).pipe(Layer.unwrapEffect);

const LSPContextLive = Layer.effect(LSPContext, makeLSPContext);

export const LspMainLive = LoggerLive.pipe(
  Layer.provideMerge(makeTS),
  Layer.provideMerge(LSPContextLive),
  Layer.provideMerge(LSPBaseLayerLive),
  Layer.provideMerge(Layer.effect(LSPConfig, makeConfig)),
);

const getDefaultProgram = (
  files: ts.MapLike<{ version: number }>,
  compilerOptions: ts.CompilerOptions,
  servicesHost: ts.LanguageServiceHost,
) => {
  return ts.createProgram({
    options: compilerOptions,
    rootNames: Object.keys(files),
    host: {
      ...ts.createCompilerHost(compilerOptions, true),
      getNewLine: () => '\n',
      useCaseSensitiveFileNames: () => true,
      writeFile: (_, __) => {},
      getCurrentDirectory: servicesHost.getCurrentDirectory,
      getDefaultLibFileName: servicesHost.getDefaultLibFileName,
      fileExists: servicesHost.fileExists,
      readFile: servicesHost.readFile,
      readDirectory: (...args) => servicesHost.readDirectory?.(...args) ?? [],
      directoryExists: (x) => servicesHost.directoryExists?.(x) ?? false,
      getDirectories: (...args) => servicesHost.getDirectories?.(...args) ?? [],
      getCanonicalFileName: (filename) => fs.realpathSync(filename, 'utf-8'),
      getSourceFile: (filename, options) =>
        ts.createSourceFile(
          filename,
          fs.readFileSync(filename, 'utf-8'),
          options,
          true,
          ts.ScriptKind.TSX,
        ),
    },
  });
};
