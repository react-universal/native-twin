import { Effect } from 'effect';
import { describe, expect, it } from 'vitest';
import {
  TwinNodeContext,
  TwinNodeContextLive,
  TwinProjectContext,
  TwinProjectContextLive,
  TwinProjectRunnerContext,
  TwinProjectRunnerContextLive,
} from '../src';
import { compilerContext } from './test.utils';

describe('Project runner', () => {
  it('get project files successfully', async () => {
    const program = Effect.andThen(TwinNodeContext, (x) => x.state.projectFiles.get).pipe(
      Effect.provide(TwinNodeContextLive),
      Effect.provide(compilerContext),
    );
    const result = await Effect.runPromiseExit(program);
    expect(result._tag).toBe('Success');
  });

  it('get project modules successfully', async () => {
    const program = Effect.andThen(TwinProjectContext, (x) => x.modulesRef).pipe(
      Effect.provide(TwinProjectContextLive),
      Effect.provide(compilerContext),
    );
    const result = await Effect.runPromiseExit(program);
    expect(result._tag).toBe('Success');
  });

  it('run native project runner', async () => {
    const program = Effect.gen(function* () {
      const { getProjectNativeSheets } = yield* TwinProjectRunnerContext;
      const transformedModules = yield* getProjectNativeSheets;

      expect(transformedModules).toBeDefined();
    }).pipe(
      Effect.onError((cause) => Effect.log('ON_ERROR: ', cause._tag)),
      Effect.provide(TwinProjectRunnerContextLive),
      Effect.provide(compilerContext),
    );
    const result = await Effect.runPromiseExit(program);

    expect(result._tag).toBe('Success');
  });
});
