import { Array, Effect, HashMap } from 'effect';
import { describe, expect, it } from 'vitest';
import { createProjectRunner } from '../src/Project/programs';
import { TestRuntime } from './test.utils';

describe('Project runner', () => {
  it('compile all project files', async () => {
    const result = await Effect.gen(function* () {
      const runner = yield* createProjectRunner;
      const modules = yield* runner.getProjectModules;
      const projectModules = Array.fromIterable(HashMap.values(modules));

      expect(projectModules).toBeDefined();
    }).pipe(TestRuntime.runPromiseExit);

    expect(result._tag).toBe('Success');
  }, 10000);
});
