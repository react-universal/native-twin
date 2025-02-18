import { Effect } from 'effect';
import { describe, expect, it } from 'vitest';
import { TwinCompilerContext } from '../src';
import { TestRuntime } from './test.utils';

describe('Watcher compiler', () => {
  it('compile all project files', async () => {
    const result = await Effect.gen(function* () {
      const { compileProjectModules } = yield* TwinCompilerContext;
      const projectFileTrees = yield* compileProjectModules('ios');

      const filesWithComponents = projectFileTrees.filter((x) => x.components.length > 0);
      const localComponents = filesWithComponents
        .flatMap((x) =>
          x.components.flatMap((x) => x.compiledTree.all()).map((x) => x.value),
        )
        .filter((x) => x.isImported);
      expect(localComponents).toBeDefined();
      expect(filesWithComponents).toBeDefined();
    }).pipe(TestRuntime.runPromiseExit);

    expect(result._tag).toBe('Success');
  }, 10000);
});
