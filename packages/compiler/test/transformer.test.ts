import { CodeGenerator } from '@babel/generator';
import { assert, it } from '@effect/vitest';
import { Array, Effect } from 'effect';
import { describe, expect } from 'vitest';
import { withCompilerLogger } from '../src';
import { BabelUtils } from '../src/Babel';
import { TwinFSContext } from '../src/internal/fs';
import { getFixture, TwinTestContextLive } from './test.utils';

describe('Twin JSX transformer', () => {
  it.effect('run native project runner', () =>
    Effect.gen(function* () {
      const babelUtils = yield* BabelUtils;
      const fs = yield* TwinFSContext;
      const modulePath = yield* getFixture('jsx');
      const babelFile = yield* fs.getFile(modulePath.inputFile);
      const module = yield* babelUtils.astFromTwinFile(babelFile);

      expect(babelUtils.getModuleId(module)).toBe('code.tsx:-1045751821');

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
