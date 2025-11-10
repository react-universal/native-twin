import { setup } from '@native-twin/core';
import { createVirtualSheet } from '@native-twin/css';
import { Effect, Trie } from 'effect';
import { bench, describe, expect } from 'vitest';
import { TwinDSLSvc } from '../src/TS';
import { TestLayer } from './dsl';
import twinConfig from './fixtures/react/tailwind.config';

setup(twinConfig, createVirtualSheet());

describe('suite', () => {
  bench('Twin-dsl bench', async () =>
    Effect.gen(function* () {
      const dsl = yield* TwinDSLSvc;
      const result = dsl.findRulesByKey('bg-red');
      expect(result.length).toBeGreaterThan(0);
      expect(Trie.size(dsl.ruleTrie)).toBeGreaterThan(0);
    }).pipe(Effect.provide(TestLayer), Effect.runPromise),
  );
});
