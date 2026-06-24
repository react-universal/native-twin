import { describe, expect, it } from '@effect/vitest';
import { Effect } from 'effect';
import * as fs from 'fs';
import { BabelUtils } from '../src/Babel';
import { getFixture, TwinTestContextLive } from './test.utils';

describe('Babel graph', () => {
  it.effect('get project files successfully', () =>
    Effect.gen(function* () {
      const modulePath = yield* getFixture('jsx');
      const parsed = yield* BabelUtils.babelParse(
        fs.readFileSync(modulePath.inputFile),
        modulePath.inputFile,
      );
      expect(parsed.program.body.length).toBeGreaterThan(1);
    }).pipe(Effect.provide(TwinTestContextLive)),
  );
});
