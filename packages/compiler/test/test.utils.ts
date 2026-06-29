import { Effect, Layer } from 'effect';
import fs from 'fs';
import path from 'path';
import { TwinNodeContext, TwinProjectContextLive, withCompilerLoggerLayer } from '../src';
import { BabelUtils } from '../src/Babel';
import { TwinFSContext, TwinFSContextLive } from '../src/internal/fs';
import * as TwinPath from '../src/internal/path';

const outputDir = path.join(__dirname, '.cache');
export const TwinNodeContextLive = TwinNodeContext.Default({
  outDir: outputDir,
  rootDir: __dirname,
  twinConfigPath: path.join(__dirname, 'tailwind.config.ts'),
});

export const TwinTestContextLive = TwinProjectContextLive.pipe(
  Layer.provideMerge(TwinFSContextLive),
  Layer.provideMerge(BabelUtils.Default),
  Layer.provideMerge(TwinNodeContextLive),
).pipe(withCompilerLoggerLayer);

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
