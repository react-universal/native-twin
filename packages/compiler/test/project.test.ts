import { describe, expect, it } from '@effect/vitest';
import { Array, Effect } from 'effect';
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

  it.effect('run native project runner', () =>
    Effect.gen(function* () {
      const { modules } = yield* TwinProjectContext;
      const transformedModules = yield* modules.get.pipe(
        // Effect.andThen((sheet) => sheet.getProjectSheets().pipe(Stream.runCollect)),
        Effect.map(Array.fromIterable),
      );

      expect(transformedModules.length).toBeGreaterThan(0);
    }).pipe(
      Effect.onError((cause) => Effect.log('ON_ERROR: ', cause._tag)),
      Effect.provide(TwinProjectContextLive),
      Effect.provide(compilerContext),
      withCompilerLogger,
    ),
  );
});
