import { LSPConfig, TypeScriptProgram } from '@native-twin/language-service/Services';
import * as Effect from 'effect/Effect';
import * as Fiber from 'effect/Fiber';
import * as Layer from 'effect/Layer';
import * as Ref from 'effect/Ref';
import * as Stream from 'effect/Stream';
import fs from 'fs';
import ts from 'ts-morph';

export const TypescriptContextLive = Effect.gen(function* () {
  // const files: ts.MapLike<{ version: number }> = {};
  const lspConfig = yield* LSPConfig;
  const project = new ts.Project({
    compilerOptions: yield* getCompilerOptions(),
  });
  const compilerOptionsRef = yield* Ref.make<ts.CompilerOptions>(yield* getCompilerOptions());
  // const serviceHostRef = yield* Ref.make<ts.LanguageServiceHost>(yield* createServiceHost());
  const programRef = yield* Ref.make<ts.Program>(project.getProgram());
  // const languageServiceRef = yield* Ref.make(yield* createLanguageService());

  const fiber = yield* lspConfig.config.changes.pipe(
    Stream.forever,
    Stream.runForEach(
      Effect.fn(function* () {
        yield* Effect.log('updating ts layers');
        yield* getCompilerOptions().pipe(Effect.andThen((x) => Ref.set(compilerOptionsRef, x)));
        // yield* createServiceHost().pipe(Effect.andThen((x) => Ref.set(serviceHostRef, x)));
        yield* Ref.set(programRef, project.getProgram());
        // yield* createLanguageService().pipe(Effect.andThen((x) => Ref.set(languageServiceRef, x)));
      }),
    ),
    Effect.fork,
  );

  Effect.addFinalizer(() => Fiber.interrupt(fiber));

  const getSourceFile = Effect.fn(function* (filename: string) {
    // const oldFile = files[filename];
    // files[filename] = { version: oldFile?.version ?? 0 };

    // const languageService = yield* languageServiceRef.get;
    const sourceFile = yield* Effect.sync(() => project.getSourceFile(filename));
    if (!sourceFile) {
      yield* Effect.logDebug('ts: Cant load sourcefile: ', filename);
      return project.createSourceFile(filename, fs.readFileSync(filename, 'utf-8'), {
        scriptKind: ts.ScriptKind.TSX,
      });
    }
    return sourceFile;
  });

  return TypeScriptProgram.of({
    getSourceFile,
  });

  function getCompilerOptions() {
    return lspConfig
      .configSelector((x) => x.tsConfigPath)
      .pipe(
        Effect.andThen((tsConfigPath) => {
          const tsConfig = ts.getCompilerOptionsFromTsConfig(tsConfigPath);
          if (tsConfig.errors.length > 0 || !tsConfig.options) {
            return Effect.fail(tsConfig.errors);
          }
          return Effect.succeed<ts.CompilerOptions>(tsConfig.options);
        }),
        // Effect.catchAll((e) =>
        //   Effect.log(`Failure creating tsConfigOptions: `, e).pipe(
        //     Effect.andThen(Effect.succeed(ts.getDefaultCompilerOptions())),
        //   ),
        // ),
      );
  }

  // function createServiceHost() {
  //   return Effect.map(
  //     compilerOptionsRef.get,
  //     (compilerOptions): ts.LanguageServiceHost => ({
  //       getScriptFileNames: () => Object.keys(files),
  //       getScriptVersion: (fileName) => files[fileName] && files[fileName].version.toString(),
  //       getScriptSnapshot: (fileName) => {
  //         if (!fs.existsSync(fileName)) return undefined;
  //         return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString('utf-8'));
  //       },
  //       getCurrentDirectory: () => process.cwd(),
  //       getCompilationSettings: () => compilerOptions,
  //       getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
  //       fileExists: ts.sys.fileExists,
  //       readFile: ts.sys.readFile,
  //       readDirectory: ts.sys.readDirectory,
  //       directoryExists: ts.sys.directoryExists,
  //       getDirectories: ts.sys.getDirectories,
  //     }),
  //   );
  // }

  // function createTSProgram() {
  //   return Effect.gen(function* () {
  //     const compilerOptions = yield* compilerOptionsRef.get;
  //     // const servicesHost = yield* serviceHostRef.get;
  //     project = new ts.Project({ compilerOptions });
  //     return project.getProgram();
  //   });
  // }
}).pipe(Layer.effect(TypeScriptProgram));

/**
 * {
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
      }
 */
