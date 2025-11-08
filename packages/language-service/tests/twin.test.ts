import { describe, expect, it, test } from '@effect/vitest';
import { setup } from '@native-twin/core';
import { createVirtualSheet } from '@native-twin/css';
import { Effect, HashMap } from 'effect';
import { createTwinDSL } from '../src/TS';
import { init } from './common';
import twinConfig from './fixtures/react/tailwind.config';

const twin = setup(twinConfig, createVirtualSheet());

describe('suite', () => {
  it.effect('twin-dsl', () =>
    Effect.gen(function* () {
      const dsl = yield* createTwinDSL(twin);
      const result = yield* dsl.findRulesByKey('b');
      expect(result.length).toBeGreaterThan(0);
      expect(HashMap.size(dsl.expandedRules)).toBeGreaterThan(0);
    }).pipe(Effect.scoped),
  );
  test('test a', async () => {
    const server = await init('react');
    // console.log('asd', server.project);
    expect(1).toBe(1);
    const doc = await server.openDocument({
      text: '<div className="bg-green" />',
      dir: 'react/index.ts',
    });
    // server.client.dispose();
    // console.log(doc);
    await doc.updateSettings({ a: 1 });
    // server.client.dispose()
  }, 10000);
});
