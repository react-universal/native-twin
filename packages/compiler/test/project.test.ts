import { Array, Effect, HashMap, Stream } from 'effect';
import { describe, expect, it } from 'vitest';
import { TwinProjectContext } from '../src';
import { TestRuntime } from './test.utils';

describe('Project runner', () => {
  it('compile all project files', async () => {
    const result = await Effect.gen(function* () {
      const project = yield* TwinProjectContext;
      const modules = yield* project.getProjectModules;
      const nativeRunner = yield* project.nativeRunner;
      const projectModules = yield* Stream.fromIterable(HashMap.values(modules)).pipe(
        Stream.mapEffect((x) => project.runTransform(x, nativeRunner)),
        Stream.runCollect,
        Effect.map(Array.fromIterable),
      );

      expect(projectModules).toBeDefined();
    }).pipe(TestRuntime.runPromiseExit);

    expect(result._tag).toBe('Success');
  }, 10000);
});
