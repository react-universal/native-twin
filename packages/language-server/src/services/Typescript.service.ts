import { LSPConfig, TypeScriptProgram } from '@native-twin/language-service/Services';
import * as Effect from 'effect/Effect';
import * as Fiber from 'effect/Fiber';
import * as Layer from 'effect/Layer';
import * as Ref from 'effect/Ref';
import * as Stream from 'effect/Stream';
import ts from 'ts-morph';

export const TypescriptContextLive = Effect.gen(function* () {
  const lspConfig = yield* LSPConfig;
  const project = new ts.Project({
    compilerOptions: yield* getCompilerOptions(),
    useInMemoryFileSystem: true,
  });
  const compilerOptionsRef = yield* Ref.make<ts.CompilerOptions>(yield* getCompilerOptions());
  const programRef = yield* Ref.make<ts.Program>(project.getProgram());

  const fiber = yield* lspConfig.config.changes.pipe(
    Stream.forever,
    Stream.runForEach(
      Effect.fn(function* () {
        yield* Effect.log('updating ts layers');
        yield* getCompilerOptions().pipe(Effect.andThen((x) => Ref.set(compilerOptionsRef, x)));
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
