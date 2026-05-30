import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import * as Fiber from 'effect/Fiber';
import * as Layer from 'effect/Layer';
import * as Ref from 'effect/Ref';
import * as Stream from 'effect/Stream';
import ts from 'ts-morph';
import { LSPConfig } from '../../core/LSPConfig.service';

type _TypescriptApi = typeof ts;
export interface TypeScriptApi extends _TypescriptApi {}
export const TypeScriptApi = Context.GenericTag<TypeScriptApi>('TypeScriptApi');

// type _TypeScriptProgram = ts.Program;
export interface TypeScriptProgram {
  getSourceFile: (filename: string, content: string) => Effect.Effect<ts.SourceFile>;
  project: ts.Project;
}
export const TypeScriptProgram = Context.GenericTag<TypeScriptProgram>('TypeScriptProgram');

export const TypescriptProgramLive = Effect.gen(function* () {
  const lspConfig = yield* LSPConfig;
  let project = new ts.Project({
    compilerOptions: yield* getCompilerOptions(),
    useInMemoryFileSystem: true,
  });
  const compilerOptionsRef = yield* Ref.make<ts.CompilerOptions>(yield* getCompilerOptions());
  const programRef = yield* Ref.make<ts.Program>(project.getProgram());

  const fiber = yield* lspConfig.config.changes.pipe(
    Stream.forever,
    Stream.runForEach(
      Effect.fn(function* (x) {
        yield* Effect.log('updating ts layers');
        const compilerOptions = yield* getCompilerOptions().pipe(
          Effect.andThen((x) => Ref.setAndGet(compilerOptionsRef, x)),
        );
        project = new ts.Project({
          compilerOptions,
          useInMemoryFileSystem: true,
          // skipAddingFilesFromTsConfig: true,
          skipFileDependencyResolution: true,
        });
        yield* Ref.set(programRef, project.getProgram());
        yield* Effect.sync(() => project.enableLogging(x.debug));
      }),
    ),
    Effect.fork,
  );

  yield* Effect.addFinalizer(() =>
    Fiber.interrupt(fiber).pipe(
      Effect.andThen((x) =>
        Effect.log(`TS Program finished: ${Exit.getOrElse(x, (x) => x.toString())}`),
      ),
    ),
  );

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
}).pipe(Effect.scoped, Layer.effect(TypeScriptProgram));
