import { Effect } from 'effect';
import * as Layer from 'effect/Layer';
import fs from 'fs';
import path from 'path';
import {
  CompilerConfigContext,
  createCompilerConfig,
  MainLayer,
  TwinFSContext,
  TwinPath,
  withCompilerLoggerLayer,
} from '../src';

const outputDir = path.join(__dirname, '.cache');
export const TestCompilerContextLive = Layer.succeed(
  CompilerConfigContext,
  createCompilerConfig({
    outDir: outputDir,
    rootDir: __dirname,
    twinConfigPath: path.join(__dirname, 'tailwind.config.ts'),
  }),
);

export const TwinTestContextLive = MainLayer.pipe(
  Layer.provideMerge(TestCompilerContextLive),
  withCompilerLoggerLayer,
);

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
