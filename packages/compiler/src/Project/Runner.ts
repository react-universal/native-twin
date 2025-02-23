import type { SheetEntry } from '@native-twin/css';
import { SheetEntryHandler } from '@native-twin/css/jsx';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import {ComponentStyledProp, type JSXMappedAttribute } from '../Babel';
import { TwinNodeContext, TwinNodeContextLive } from '../Config';
import type { CompilerStyleSheet } from '../StyleSheet';
import type { TwinExtractorFn, TwinRunnerPlatform, TwinTransformFn } from './Model';
import { TwinProjectContext, TwinProjectContextLive } from './Service';
import { createModuleTransformer, makeTransformer } from './Transformer';

const make = Effect.gen(function* () {
  const ctx = yield* TwinNodeContext;
  const project = yield* TwinProjectContext;
  const nativeTransformer: TwinTransformFn = createModuleTransformer(
    createExtractor('native'),
    project.getCurrentModules(),
  );
  const webTransformer: TwinTransformFn = createModuleTransformer(
    createExtractor('web'),
    project.getCurrentModules(),
  );
  const runNative = makeTransformer(nativeTransformer, project.getCurrentModules());
  const runWeb = makeTransformer(webTransformer, project.getCurrentModules());

  return {
    runNative,
    runWeb,
  };

  function createExtractor(platform: TwinRunnerPlatform): Effect.Effect<TwinExtractorFn> {
    return getPlatformRunner(platform).pipe(
      Effect.andThen((runner) =>
        createStylesProcessor(createSheetEntriesExtractor(runner.ctx, runner.twinFn)),
      ),
    );
  }

  function getPlatformRunner(platform: TwinRunnerPlatform) {
    return Effect.map(ctx.state.twRunners.get, ({ native, web }) =>
      platform === 'native' ? native : web,
    );
  }

  function createStylesProcessor(f: (prop: JSXMappedAttribute) => SheetEntryHandler[]) {
    return (props: JSXMappedAttribute[]) =>
      props.map((prop) => new ComponentStyledProp(prop, f(prop)));
  }

  function createSheetEntriesExtractor(
    ctx: CompilerStyleSheet['ctx'],
    getEntries: (from: string) => SheetEntry[],
  ) {
    return (prop: JSXMappedAttribute) =>
      RA.map(getEntries(prop.value.text), (x) => new SheetEntryHandler(x, ctx));
  }
});

export interface TwinProjectRunnerContext extends Effect.Effect.Success<typeof make> {}
export const TwinProjectRunnerContext = Context.GenericTag<TwinProjectRunnerContext>(
  'TwinProjectRunnerContext',
);
export const TwinProjectRunnerContextLive = Layer.effect(
  TwinProjectRunnerContext,
  make,
).pipe(Layer.provide(TwinNodeContextLive), Layer.provide(TwinProjectContextLive));
