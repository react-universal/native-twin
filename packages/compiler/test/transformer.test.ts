import { CodeGenerator } from '@babel/generator';
import { assert, it } from '@effect/vitest';
import { Array, Effect } from 'effect';
import { describe, expect } from 'vitest';
import { BabelUtils, TwinProjectContext, withCompilerLogger } from '../src';
import { getFixture, TwinTestContextLive } from './test.utils';

describe('Twin JSX transformer', () => {
  it.effect('run native project runner', () =>
    Effect.gen(function* () {
      const { getTwinModuleAstFromPath } = yield* BabelUtils;
      const modulePath = yield* getFixture('jsx');
      const module = yield* getTwinModuleAstFromPath(modulePath.inputFile);

      expect(module.id).toBe('code.tsx:-1045751821');

      const gen = new CodeGenerator(module.ast);
      const code = gen.generate().code;

      // yield* modulePath.writeOutput(code);
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
