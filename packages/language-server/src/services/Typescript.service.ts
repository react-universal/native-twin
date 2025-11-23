import { TypescriptApi } from '@native-twin/language-service';
import { LSPConfig } from '@native-twin/language-service/Services';
import * as Effect from 'effect/Effect';
import * as Fiber from 'effect/Fiber';
import * as Layer from 'effect/Layer';
import * as Ref from 'effect/Ref';
import * as Stream from 'effect/Stream';
import fs from 'fs';
import ts from 'typescript';

export const TypescriptContextLive = Effect.gen(function* () {
  const files: ts.MapLike<{ version: number }> = {};
  const lspConfig = yield* LSPConfig;
  const compilerOptionsRef = yield* Ref.make<ts.CompilerOptions>(yield* getCompilerOptions());
  const serviceHostRef = yield* Ref.make<ts.LanguageServiceHost>(yield* createServiceHost());
  const programRef = yield* Ref.make<ts.Program>(yield* createTSProgram(files));
  const languageServiceRef = yield* Ref.make(yield* createLanguageService());

  const fiber = yield* lspConfig.config.changes.pipe(
    Stream.forever,
    Stream.runForEach(
      Effect.fn(function* () {
        yield* Effect.log('updating ts layers');
        yield* getCompilerOptions().pipe(Effect.andThen((x) => Ref.set(compilerOptionsRef, x)));
        yield* createServiceHost().pipe(Effect.andThen((x) => Ref.set(serviceHostRef, x)));
        yield* createTSProgram(files).pipe(Effect.andThen((x) => Ref.set(programRef, x)));
        yield* createLanguageService().pipe(Effect.andThen((x) => Ref.set(languageServiceRef, x)));
      }),
    ),
    Effect.fork,
  );

  Effect.addFinalizer(() => Fiber.interrupt(fiber));

  const getSourceFile = Effect.fn(function* (filename: string) {
    const oldFile = files[filename];
    files[filename] = { version: oldFile?.version ?? 0 };

    const languageService = yield* languageServiceRef.get;
    const program = yield* Effect.fromNullable(languageService.getProgram()).pipe(
      Effect.catchAll(() => programRef.get),
    );
    const sourceFile = program.getSourceFile(filename);
    if (!sourceFile) {
      yield* Effect.logDebug('ts: Cant load sourcefile: ', filename);
      return ts.createSourceFile(
        filename,
        fs.readFileSync(filename, 'utf-8'),
        ts.ScriptTarget.ESNext,
      );
    }
    return sourceFile;
  });

  return TypescriptApi.TypeScriptProgram.of({
    getSourceFile,
  });

  function createLanguageService() {
    return Effect.map(serviceHostRef.get, (host) =>
      ts.createLanguageService(host, ts.createDocumentRegistry(), true),
    );
  }

  function getCompilerOptions() {
    return lspConfig
      .configSelector((x) => x.tsConfigPath)
      .pipe(
        Effect.andThen((tsConfigPath) => {
          const tsConfig = ts.readConfigFile(tsConfigPath, (path) =>
            fs.readFileSync(path, 'utf-8'),
          );
          if (tsConfig.error || !tsConfig.config) {
            return Effect.fail(tsConfig.error);
          }
          return Effect.succeed<ts.CompilerOptions>(tsConfig.config);
        }),
        Effect.catchAll((e) =>
          Effect.log(`Failure creating tsConfigOptions: `, e).pipe(
            Effect.andThen(Effect.succeed(ts.getDefaultCompilerOptions())),
          ),
        ),
      );
  }

  function createServiceHost() {
    return Effect.map(
      compilerOptionsRef.get,
      (compilerOptions): ts.LanguageServiceHost => ({
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
      }),
    );
  }

  function createTSProgram(files: ts.MapLike<{ version: number }>) {
    return Effect.gen(function* () {
      const compilerOptions = yield* compilerOptionsRef.get;
      const servicesHost = yield* serviceHostRef.get;
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
    });
  }
}).pipe(Layer.effect(TypescriptApi.TypeScriptProgram));
