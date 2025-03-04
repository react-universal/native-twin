import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as HashMap from 'effect/HashMap';
import * as Layer from 'effect/Layer';
import * as Stream from 'effect/Stream';
import {
  BabelContext,
  BabelContextLive,
  type TwinBabelModule,
  makeDependenciesLookup,
} from '../Babel';
import { TwinNodeContext, TwinNodeContextLive, type TwinRunnerPlatform } from '../Config';
import { TwinStyleSheetContext, TwinStyleSheetContextLive } from '../StyleSheet';
import { traverseTreeEffect } from '../utils/tree.utils';

const make = Effect.gen(function* () {
  const ctx = yield* TwinNodeContext;
  const { updateModules, modules } = yield* BabelContext;
  const sheet = yield* TwinStyleSheetContext;

  yield* updateModules();

  return {
    sheet,
  };

  function createLookup() {
    return modules.get.pipe(
      Effect.andThen((x) => makeDependenciesLookup(HashMap.toValues(x))),
    );
  }

  function transformModule(module: TwinBabelModule, platform: TwinRunnerPlatform) {
    return Effect.gen(function* () {
      const lookup = yield* createLookup();
      Stream.fromIterable(module.jsxElements).pipe(
        Stream.mapEffect((jsxElement) =>
          Effect.gen(function* () {
            yield* traverseTreeEffect(jsxElement.tree, (treeNode) => {
              const dependency = lookup(treeNode.value);
              treeNode.value.babelPath.hub
              treeNode.value.styledProps.map((x) => x.twinRules.map((x) => x));
              return Effect.void;
            });
          }),
        ),
      );
    });
  }
});

export interface TwinProjectContext extends Effect.Effect.Success<typeof make> {}
export const TwinProjectContext =
  Context.GenericTag<TwinProjectContext>('TwinProjectContext');

export const TwinProjectContextLive = Layer.effect(TwinProjectContext, make).pipe(
  Layer.provide(TwinStyleSheetContextLive),
  Layer.provide(TwinNodeContextLive),
  Layer.provide(BabelContextLive),
);
