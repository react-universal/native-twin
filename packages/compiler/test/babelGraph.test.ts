import traverse, { type NodePath } from '@babel/traverse';
import { assert, describe, expect, it } from '@effect/vitest';
import { Array, Effect, HashSet, Stream } from 'effect';
import * as fs from 'fs';
import { BabelContext, babelParse, TwinNodeContext } from '../src';
import { getFixture, TwinTestContextLive } from './test.utils';

describe('Babel graph', () => {
  it.effect('get project files successfully', () =>
    Effect.gen(function* () {
      const ctx = yield* TwinNodeContext;
      const modulePath = yield* getFixture('jsx');
      const parsed = babelParse(fs.readFileSync(modulePath.inputFile), modulePath.inputFile);
    }).pipe(Effect.provide(TwinTestContextLive)),
  );
});
