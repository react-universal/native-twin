import { describe, expect, it } from '@effect/vitest';
import { Effect, Layer, Stream } from 'effect';
import { BabelUtils, TwinFSContext, TwinFSContextLive, TwinNodeContextLive } from '../src';
import { getFixture, TestCompilerContextLive } from './test.utils';

const testLayer = BabelUtils.Default.pipe(
  Layer.provideMerge(TwinFSContextLive),
  Layer.provide(TwinNodeContextLive),
  Layer.provide(TestCompilerContextLive),
);
describe('Babel Service', () => {
  it.effect('Get twin file ast', () =>
    Effect.gen(function* () {
      const modulePath = yield* getFixture('jsx');
      const fs = yield* TwinFSContext;
      const twinFile = yield* fs.getFile(modulePath.inputFile);
      const babelFile = yield* fs
        .readFile(modulePath.inputFile)
        .pipe(Effect.andThen((code) => BabelUtils.babelParse(code, modulePath.inputFile)));

      expect(babelFile.errors).toBeDefined();
      expect(babelFile.errors?.length).toBe(0);
    }).pipe(Effect.provide(testLayer)),
  );
});
