import { CodeGenerator } from '@babel/generator';
import { assert, it } from '@effect/vitest';
import { Array, Effect } from 'effect';
import { describe, expect } from 'vitest';
import { TwinProjectContext, withCompilerLogger } from '../src';
import { getFixture, TwinTestContextLive } from './test.utils';

describe('Twin JSX transformer', () => {
  it.effect('run native project runner', () =>
    Effect.gen(function* () {
      const { getTwinFileAstFromPath } = yield* TwinProjectContext;
      const modulePath = yield* getFixture('jsx');
      const module = yield* getTwinFileAstFromPath(modulePath.inputFile);

      expect(module.id).toBe('code.tsx:998016606');

      const gen = new CodeGenerator(module.ast);
      const code = gen.generate().code;

      yield* modulePath.writeOutput(code);
      const jsxElements = Array.fromIterable([1]);
      expect(jsxElements.length).toBeGreaterThan(0);
      assert.isString(code);
    }).pipe(
      Effect.scoped,
      Effect.onError((cause) => Effect.log('ON_ERROR: ', cause._tag)),
      Effect.provide(TwinTestContextLive),
      withCompilerLogger,
    ),
  );
});
