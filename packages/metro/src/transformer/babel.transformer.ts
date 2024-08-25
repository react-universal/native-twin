// import generate from '@babel/generator';
import upstreamTransformer from '@expo/metro-config/babel-transformer';
import * as Effect from 'effect/Effect';
// import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
// import * as Option from 'effect/Option';
// import * as MutableHashMap from 'effect/MutableHashMap';
import { BabelLogger } from '@native-twin/babel/jsx-babel';
import {
  BabelTransformerContext,
  BabelTransformerService,
  BabelTransformerServiceLive,
  BabelTransformerFn,
  babelTraverseCode,
} from './babel';
import { BabelCacheContext } from './babel/babel.cache';

const mainProgram = Effect.gen(function* () {
  const ctx = yield* BabelTransformerContext;
  const transformer = yield* BabelTransformerService;
  yield* BabelCacheContext;

  if (transformer.isNotAllowedPath(ctx.filename)) return ctx.code;

  // const compiled = yield* transformer.compileCode(ctx.code);
  const compiled = yield* babelTraverseCode(ctx.code);
  // console.log('RESLT: ', result);

  // return pipe(
  //   compiled.generated,
  //   Option.map((x) => generate(x)),
  //   Option.map((x) => x.code),
  //   Option.getOrElse(() => ctx.code),
  // );
  return compiled.generated;
});

const MainLayer = Layer.merge(BabelTransformerServiceLive, BabelCacheContext.Live).pipe(
  Layer.merge(Logger.replace(Logger.defaultLogger, BabelLogger)),
);

export const babelRunnable = Effect.scoped(
  mainProgram.pipe(Logger.withMinimumLogLevel(LogLevel.All), Effect.provide(MainLayer)),
);

export const transform: BabelTransformerFn = async (params) => {
  return babelRunnable.pipe(
    Effect.provide(
      BabelTransformerContext.make(params, {
        componentID: true,
        styledProps: true,
        templateStyles: true,
        tree: true,
        order: true,
      }),
    ),
    Effect.map((code) =>
      // @ts-expect-error
      upstreamTransformer.transform({
        src: code,
        options: params.options,
        filename: params.filename,
      }),
    ),
    Effect.runPromise,
  );
};
