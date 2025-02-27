import { describe, expect, it } from '@effect/vitest';
import { Array, Effect, HashMap } from 'effect';
import {
  TwinNodeContext,
  TwinNodeContextLive,
  TwinProjectContext,
  TwinProjectContextLive,
} from '../src';
import { compilerContext } from './test.utils';

describe('Project runner', () => {
  it.effect('get project files successfully', () =>
    Effect.andThen(TwinNodeContext, (x) => x.state.projectFiles.get).pipe(
      Effect.provide(TwinNodeContextLive),
      Effect.provide(compilerContext),
    ),
  );

  it.effect('get project modules successfully', () =>
    Effect.andThen(TwinProjectContext, (x) => x.modulesHandler.get).pipe(
      Effect.andThen((modules) => expect(HashMap.size(modules)).toBeGreaterThan(0)),
      Effect.provide(TwinProjectContextLive),
      Effect.provide(compilerContext),
    ),
  );

  it.effect('run native project runner', () =>
    Effect.gen(function* () {
      const { projectRunner } = yield* TwinProjectContext;
      const transformedModules = yield* projectRunner.pipe(
        Effect.andThen((p) =>
          Effect.all(
            HashMap.toValues(p).map((x) =>
              x.toPlatform('native').pipe(Effect.map(Array.fromIterable)),
            ),
          ),
        ),
        Effect.map(Array.flatten),
      );

      expect(transformedModules).toBeDefined();
    }).pipe(
      Effect.onError((cause) => Effect.log('ON_ERROR: ', cause._tag)),
      Effect.provide(TwinProjectContextLive),
      Effect.provide(compilerContext),
    ),
  );
});
