import { describe, expect, it } from '@effect/vitest';
import { StylesInterpreter } from '@native-twin/css';
import { Array, Effect, Stream } from 'effect';
import {
  TwinFSContextLive,
  TwinNodeContext,
  TwinNodeContextLive,
  TwinProjectContext,
  TwinProjectContextLive,
  withCompilerLogger,
} from '../src';
import { transformModule } from '../src/Programs/transform.program';
import { prevalStyleSheet } from '../src/Programs/transpiler.program';
import { TwinStyleSheetContextLive } from '../src/StyleSheet';
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
      const { moduleFromFilePath, compileModule } = yield* TwinProjectContext;
      const modulePath = yield* getFixture('jsx');
      const module = yield* moduleFromFilePath(modulePath.inputFile);
      const elements = yield* Stream.fromIterable(module.jsxElements).pipe(
        Stream.flatMap((x) => Stream.fromIterable(x.tree.all())),
        Stream.runCollect,
        Effect.map(Array.fromIterable),
      );
      const preval = yield* Stream.fromIterableEffect(
        transformModule(module, { platform: 'native' }),
      ).pipe(
        Stream.mapEffect(([id, sheet]) => {
          const interpreter = StylesInterpreter.make({ platform: 'native', rem: 16 });
          return prevalStyleSheet(sheet, interpreter);
        }),
        Stream.flattenIterables,
        Stream.runCollect,
        Effect.map(Array.fromIterable),
      );

      const compiled = yield* compileModule(module, 'native');
      const jsxElements = Array.fromIterable(compiled.jsxElements);
      expect(preval.length).toBeGreaterThan(0);
      expect(elements.length).toBeGreaterThan(0);
      expect(jsxElements.length).toBeGreaterThan(0);
    }).pipe(
      Effect.scoped,
      Effect.onError((cause) => Effect.log('ON_ERROR: ', cause._tag)),
      Effect.provide(TwinProjectContextLive),
      Effect.provide(TwinFSContextLive),
      Effect.provide(TwinStyleSheetContextLive),
      Effect.provide(TwinNodeContextLive),
      Effect.provide(compilerContext),
      withCompilerLogger,
    ),
  );
});
