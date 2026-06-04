import { describe, it } from '@effect/vitest';
import { Effect } from 'effect';
import * as fs from 'fs';
import { BabelUtils } from '../src';
import { getFixture, TwinTestContextLive } from './test.utils';

describe('Babel graph', () => {
  it.effect('get project files successfully', () =>
    Effect.gen(function* () {
      const modulePath = yield* getFixture('jsx');
      const babel = yield* BabelUtils;
      babel.babelParse(fs.readFileSync(modulePath.inputFile), modulePath.inputFile);
    }).pipe(Effect.provide(BabelUtils.Default), Effect.provide(TwinTestContextLive)),
  );
});
