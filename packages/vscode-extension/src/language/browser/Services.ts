import { LSPConfig } from '@native-twin/language-service';
import { TypeScriptProgram } from '@native-twin/language-service/ts-adapter';
import * as Effect from 'effect/Effect';
import * as Fiber from 'effect/Fiber';
import * as Layer from 'effect/Layer';
import * as Ref from 'effect/Ref';
import * as Stream from 'effect/Stream';
import ts from 'ts-morph';

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
        yield* Ref.set(programRef, project.getProgram());
      }),
    ),
    Effect.fork,
  );

  yield* Effect.addFinalizer(() => Fiber.interrupt(fiber));

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
