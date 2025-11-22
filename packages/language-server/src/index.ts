import fs from 'node:fs';
import * as NodeContext from '@effect/platform-node/NodeContext';
import * as NodeRuntime from '@effect/platform-node/NodeRuntime';
import {
  Completions,
  getClientCapabilities,
  LSPConfigService,
  LSPConnectionService,
  languagePrograms,
  TwinLSPDocumentContext,
  twinCompletionsToVscode,
} from '@native-twin/language-service';
import * as Effect from 'effect/Effect';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import * as Option from 'effect/Option';
import ts from 'typescript';
import { LspMainLive } from './lsp.layer.js';

const Runtime = ManagedRuntime.make(LspMainLive);

// function makeRuntime(program: ts.Program) {
//   return <A, E, R>(execute: Effect.Effect<A, E, R>) => {
//     return execute.pipe(
//       Effect.provide(LspMainLive),
//       // Effect.provideService(TypescriptApi.TypeScriptProgram, program),
//       Effect.runPromise,
//     );
//   };
// }

const createTsAPI = (rootFileNames: string[], options: ts.CompilerOptions) => {
  const files: ts.MapLike<{ version: number }> = {};
  // initialize the list of files
  rootFileNames.forEach((fileName) => {
    files[fileName] = { version: 0 };
  });

  // Create the language service host to allow the LS to communicate with the host
  const servicesHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => rootFileNames,
    getScriptVersion: (fileName) => files[fileName] && files[fileName].version.toString(),
    getScriptSnapshot: (fileName) => {
      if (!fs.existsSync(fileName)) {
        return undefined;
      }

      return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => options,
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
  };
  const languageService = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());

  return languageService;
};

const program = Effect.gen(function* () {
  const Connection = yield* LSPConnectionService;
  const documentService = yield* TwinLSPDocumentContext;
  const config = yield* LSPConfigService;
  const currentConfig = yield* config.get;

  const root = currentConfig.workspaceRoot.pipe(Option.getOrElse(() => process.cwd()));
  const languageService = createTsAPI([root], ts.getDefaultCompilerOptions());

  Connection.onInitialize(async (params) => {
    const capabilities = getClientCapabilities(params.capabilities);

    const configOptions = params.initializationOptions;
    await Runtime.runPromise(config.onUpdateConfig(configOptions));

    return capabilities;
  });

  Connection.onDidChangeConfiguration(async (changes) => {
    await Effect.runPromise(config.onConfigConnectionChange(changes.settings));
  });

  Connection.onCompletion(async (params) => {
    const program = languageService.getProgram();
    if (!program) return;

    const items = await Completions.vscodeCompletionsProgram(
      params.textDocument.uri,
      params.position,
    ).pipe(
      Effect.andThen((result) =>
        documentService.getDocument(params.textDocument.uri).pipe(
          Effect.andThen((_) => {
            const document = Option.getOrNull(_)!;
            return twinCompletionsToVscode(
              result.region,
              document,
              document.offsetAt(params.position),
            );
          }),
        ),
      ),
      Runtime.runPromise,
    );

    return {
      isIncomplete: true,
      items: items,
    };
  });

  Connection.onCompletionResolve(
    async (...args) =>
      // languagePrograms.getCompletionEntryDetails(...args).pipe(Runtime.runPromise),
      args[0],
  );

  Connection.onHover(
    async (..._args) =>
      // languagePrograms.getHoverDetails(...args).pipe(Runtime.runPromise),
      undefined,
  );

  Connection.languages.diagnostics.on(async (..._args) =>
    // languagePrograms.getDocumentDiagnosticsProgram(...args).pipe(Runtime.runPromise),
    ({
      kind: 'full',
      items: [],
    }),
  );

  Connection.onDocumentColor(async (...params) =>
    languagePrograms.getDocumentColors(...params).pipe(Runtime.runPromise),
  );

  Connection.onDocumentHighlight(async (...args) => {
    const data = await languagePrograms
      .getDocumentHighLightsProgram(...args)
      .pipe(Runtime.runPromise);
    return data;
  });

  Connection.onSelectionRanges(async (_params, _token, _, __) => {
    return [];
  });

  Connection.onCodeAction(async (params, _token, _workDone) => {
    const data = await languagePrograms.twinCodeActionsProgram(params).pipe(Runtime.runPromise);

    return data;
  });

  Connection.onCodeActionResolve(async (params) => {
    // console.log('PARAMS: ', params);
    return {
      ...params,
    };
  });

  Connection.onShutdown(() => {
    Connection.console.log('shootDown');
    Connection.dispose();
  });

  Connection.listen();
  const listener = documentService.handler.listen(Connection);

  Effect.addFinalizer((exit) => {
    Connection.console.debug('Disposing Connection');
    Connection.dispose();
    Connection.console.debug('Disposing Documents Handler');
    listener.dispose();
    Connection.console.debug(`Closing reason: ${exit.toJSON()}`);
    return Effect.void;
  });
}).pipe(
  Effect.provide(NodeContext.layer),
  Effect.catchAll((error) => Effect.log(`Language server failed: ${error}`)),
);

Runtime.runFork(program);

NodeRuntime.runMain(Runtime.runtimeEffect);
