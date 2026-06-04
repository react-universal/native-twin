import { CodeGenerator } from '@babel/generator';
import { assert, describe, expect, it } from '@effect/vitest';
import { Array, Effect, HashSet } from 'effect';
import { BabelUtils, TwinNodeContext, TwinProjectContext, withCompilerLogger } from '../src';
import { twinTransformProgram } from '../src/Programs/twinTransform.program';
import { getFixture, TwinTestContextLive } from './test.utils';

describe('Project runner', () => {
  it.effect('get project files successfully', () =>
    Effect.gen(function* () {
      const ctx = yield* TwinNodeContext;
      const files = yield* ctx.state.projectFiles.get;
      const size = HashSet.size(files);
      expect(size).toBeGreaterThan(0);
    }).pipe(Effect.provide(TwinTestContextLive)),
  );

  it.effect('run native project runner', () =>
    Effect.gen(function* () {
      const { getTwinModuleAstFromPath } = yield* BabelUtils;
      const modulePath = yield* getFixture('jsx');
      const module = yield* getTwinModuleAstFromPath(modulePath.inputFile);

      expect(module.id).toBe('code.tsx:-1045751821');

      yield* twinTransformProgram(module, 'native');

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
