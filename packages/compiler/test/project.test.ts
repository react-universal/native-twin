import { describe, expect, it } from '@effect/vitest';
import { Effect } from 'effect';
import { TwinProjectRunnerContext } from '../src';
import { TestMainLive } from './test.utils';

describe('Project runner', () => {
  it.effect(
    'run native project runner',
    () =>
      Effect.gen(function* () {
        const { runNative } = yield* TwinProjectRunnerContext;
        const transformedModules = yield* runNative;

        expect(transformedModules).toBeDefined();
      }).pipe(
        Effect.onError((cause) => Effect.log('ON_ERROR: ', cause._tag)),
        Effect.provide(TestMainLive),
      ),
    {
      timeout: 10000,
    },
  );
});
