import { Array, Effect, HashMap, pipe } from 'effect';
import { describe, expect, it } from 'vitest';
import { TwinProjectRunnerContext } from '../src';

describe('TwinCSSExtractor program', () => {
  it('TwinCSSExtractor', async () => {
    Effect.gen(function* () {
      const { native } = yield* TwinProjectRunnerContext;

      const result = yield* native.runProject;
      // TwinCSSExtractor(`() => <div className='flex-1' />`, 'test.tsx'),

      const treeNodes = pipe(
        HashMap.fromIterable(result),
        Array.fromIterable,
        Array.flatMap((x) => Array.fromIterable(x[1])),
      );

      console.log('TREE_NODES: ', treeNodes);

      expect(treeNodes.length).toBeGreaterThan(0);
    });
  });
});
