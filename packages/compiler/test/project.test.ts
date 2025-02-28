import { describe, expect, it } from '@effect/vitest';
import { Effect, HashMap } from 'effect';
import {
  TwinNodeContext,
  TwinNodeContextLive,
  TwinProjectContext,
  TwinProjectContextLive,
  withCompilerLogger,
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
      const { transformProject } = yield* TwinProjectContext;
      const transformedModules = yield* transformProject('native');

      expect(transformedModules.modulesMap.size).toBeGreaterThan(0);
    }).pipe(
      Effect.onError((cause) => Effect.log('ON_ERROR: ', cause._tag)),
      Effect.provide(TwinProjectContextLive),
      Effect.provide(compilerContext),
      withCompilerLogger,
    ),
  );
});
