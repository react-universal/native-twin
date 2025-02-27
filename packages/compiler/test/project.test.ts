import { Array, Effect, HashMap } from 'effect';
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
      const { projectRunner } = yield* TwinProjectRunnerContext;
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
      Effect.provide(TwinProjectRunnerContextLive),
      Effect.provide(compilerContext),
    );
    const result = await Effect.runPromiseExit(program);

    expect(result._tag).toBe('Success');
  });
});
