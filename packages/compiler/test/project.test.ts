import { describe, expect, it } from '@effect/vitest';
import { Array, Effect } from 'effect';
import {
  TwinFSContextLive,
  TwinNodeContext,
  TwinNodeContextLive,
  TwinProjectContext,
  TwinProjectContextLive,
  withCompilerLogger,
} from '../src';
import { compilerContext, getFixture } from './test.utils';

describe('Project runner', () => {
  it.effect('get project files successfully', () =>
    Effect.andThen(TwinNodeContext, (x) => x.state.projectFiles.get).pipe(
      Effect.provide(TwinNodeContextLive),
      Effect.provide(compilerContext),
    ),
  );

  it.effect('run native project runner', () =>
    Effect.gen(function* () {
      const { getModule, compileModule } = yield* TwinProjectContext;
      const modulePath = yield* getFixture('jsx');
      const module = yield* getModule(modulePath.inputFile);

      const compiled = yield* compileModule(module, 'native');
      const jsxElements = Array.fromIterable(compiled.jsxElements);
      expect(jsxElements.length).toBeGreaterThan(0);
    }).pipe(
      Effect.scoped,
      Effect.onError((cause) => Effect.log('ON_ERROR: ', cause._tag)),
      Effect.provide(TwinProjectContextLive),
      Effect.provide(TwinFSContextLive),
      Effect.provide(compilerContext),
      withCompilerLogger,
    ),
  );
});
