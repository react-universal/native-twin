import { describe, expect, it } from '@effect/vitest';
import { Effect } from 'effect';
import { BabelUtils } from '../src/Babel';
import { TwinFSContext } from '../src/internal/fs';
import { getFixture, TwinTestContextLive } from './test.utils';

describe('Babel Service', () => {
  it.effect('Get twin file ast', () =>
    Effect.gen(function* () {
      const modulePath = yield* getFixture('jsx');
      const fs = yield* TwinFSContext;
      const babelUtils = yield* BabelUtils;
      // const twinFile = yield* fs.getFile(modulePath.inputFile);
      const babelFile = yield* fs
        .readFile(modulePath.inputFile)
        .pipe(Effect.andThen((code) => babelUtils.babelParse(code, modulePath.inputFile)));

      expect(babelFile.errors).toBeDefined();
      expect(babelFile.errors?.length).toBe(0);
    }).pipe(Effect.provide(TwinTestContextLive)),
  );
});
