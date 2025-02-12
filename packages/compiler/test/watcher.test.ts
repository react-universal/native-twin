import { Array, Effect, Stream } from 'effect';
import { describe, expect, it } from 'vitest';
import { FSUtils, TwinNodeContext, TwinPath, TwinResolverContext } from '../src';
import { TestRuntime } from './test.utils';

describe('Watcher compiler', () => {
  it('compile all project files', async () => {
    const result = await Effect.gen(function* () {
      const fs = yield* FSUtils.FsUtils;
      const path = yield* TwinPath.TwinPath;
      const ctx = yield* TwinNodeContext;
      const { loadFile } = yield* TwinResolverContext;
      const outputFile = ctx.getOutputCSSPath('ios');
      yield* fs.mkdirCached(path.make.absoluteFromString(path.dirname(outputFile)));
      yield* fs.writeFileCached({ path: outputFile, override: true });
      const projectFiles = Array.fromIterable(yield* ctx.state.projectFiles.get).filter(
        (path) => path.includes('/jsx/'),
      );

      const projectFileTrees = yield* Stream.fromIterable(projectFiles).pipe(
        Stream.mapEffect((data) => loadFile({ filename: data })),
        Stream.runCollect,
        Effect.map(Array.fromIterable),
      );

      expect(projectFileTrees).toBeDefined();
    }).pipe(TestRuntime.runPromiseExit);

    expect(result._tag).toBe('Success');
  }, 10000);
});
