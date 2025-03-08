import fs from 'fs';
import path from 'path';
import { Effect } from 'effect';
import * as Layer from 'effect/Layer';
import {
  CompilerConfigContext,
  TwinFSContext,
  TwinPath,
  createCompilerConfig,
} from '../src';

const outputDir = path.join(__dirname, '.cache');
export const compilerContext = Layer.succeed(
  CompilerConfigContext,
  createCompilerConfig({
    outDir: outputDir,
    rootDir: __dirname,
    twinConfigPath: path.join(__dirname, 'tailwind.config.ts'),
  }),
);
// const tw = createTailwind(tailwindConfig, createVirtualSheet());
// export const TestMainLive = Layer.empty.pipe(
//   Layer.provideMerge(TwinNodeContextLive),
//   Layer.provideMerge(TwinFSContextLive),
//   Layer.provideMerge(TwinProjectRunnerContextLive),
//   Layer.provideMerge(TwinProjectContextLive),
//   Layer.provideMerge(compilerContext),
//   withCompilerLoggerLayer
// );

// export const TestRuntime = ManagedRuntime.make(TestMainLive);

export const writeFixtureOutput = (
  code: string,
  paths: { fixturePath: string; outputFile: string },
) => {
  const filePath = path.join(__dirname, 'fixtures', paths.fixturePath, paths.outputFile);
  fs.writeFileSync(filePath, code);
  return code;
};

export const getFixture = (name: string) =>
  Effect.gen(function* () {
    const fs = yield* TwinFSContext;
    const inputFile = TwinPath.filePathFromString(
      path.join(__dirname, `fixtures/${name}/code.tsx`),
    );
    const outputFile = TwinPath.filePathFromString(
      path.join(__dirname, `fixtures/${name}/code.out.tsx`),
    );
    const writeOutput = (content: string) => fs.writeFile(outputFile, content);

    return {
      inputFile,
      outputFile,
      writeOutput,
    };
  }).pipe(Effect.withLogSpan('FIXTURE_FILES'));
