import { CodeGenerator } from '@babel/generator';
import { describe, expect, it } from '@effect/vitest';
import { Array, Effect, HashSet } from 'effect';
import { TwinFSContext, TwinNodeContext, TwinProjectContext, withCompilerLogger } from '../src';
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
      const { compileAst, getTwinFileAstFromPath } = yield* TwinProjectContext;
      const fs = yield* TwinFSContext;
      const modulePath = yield* getFixture('jsx');
      const module = yield* getTwinFileAstFromPath(modulePath.inputFile);

      expect(module.id).toBe('code.tsx:998016606');

      const compiled = yield* compileAst(module, 'native');

      const gen = new CodeGenerator(module.ast);
      const code = gen.generate().code;
      yield* fs.writeFile(modulePath.outputFile, code);
      const jsxElements = Array.fromIterable(compiled);
      // expect(preval.length).toBeGreaterThan(0);
      // expect(elements.length).toBeGreaterThan(0);
      expect(jsxElements.length).toBeGreaterThan(0);
    }).pipe(
      // Effect.catchAll((error) => Effect.log(error.toJSON())),
      Effect.scoped,
      Effect.onError((cause) => Effect.log('ON_ERROR: ', cause._tag)),
      Effect.provide(TwinTestContextLive),
      withCompilerLogger,
    ),
  );
});
