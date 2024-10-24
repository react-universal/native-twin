import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { apply, identity, pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import worker from 'metro-transform-worker';
import { transformJSXFile } from '@native-twin/babel/jsx-babel';
import type { BabelTransformerFn, TwinTransformFn } from '@native-twin/babel/models';
import {
  BabelTransformerService,
  MetroCompilerContext,
  NativeTwinService,
} from '@native-twin/babel/services';
import { MetroWorkerService } from './MetroWorker.service';
import type { MetroWorkerInput } from './models/metro.models';

export class MetroTransformerRunners extends Context.Tag('metro/transformer/runners')<
  MetroTransformerRunners,
  {
    runWorker: (config: MetroWorkerInput) => Effect.Effect<worker.TransformResponse>;
    runTwinTransform: (config: Parameters<BabelTransformerFn>) => Effect.Effect<string>;
    runBabelTransform: (config: Parameters<BabelTransformerFn>) => Effect.Effect<any>;
  }
>() {}

export const MetroTransformerRunnerLive = Effect.gen(function* () {
  yield* MetroWorkerService;
  yield* BabelTransformerService;
  yield* MetroCompilerContext;
  yield* NativeTwinService;

  return {
    runWorker,
    runTwinTransform: () => runTwinTransform,
    runBabelTransform,
  };
});

const runWorker = (config: MetroWorkerInput) =>
  Effect.gen(function* () {
    const params: [...Parameters<TwinTransformFn>] = [
      config.config,
      config.projectRoot,
      config.filename,
      config.data,
      config.options,
    ] as const;
    const transformer = pipe(
      Option.fromNullable(config.config.transformerPath),
      Option.map((path): TwinTransformFn => require(path).transform),
      Option.getOrElse((): TwinTransformFn => worker.transform),
    );
    const response = yield* Effect.promise(() =>
      pipe(
        (args: [...Parameters<TwinTransformFn>]) => transformer(...args),
        apply(identity(params)),
      ),
    );

    return response as worker.TransformResponse;
  });

const runTwinTransform = Effect.gen(function* () {
  const ctx = yield* MetroCompilerContext;
  const transformer = yield* BabelTransformerService;
  yield* NativeTwinService;

  if (transformer.isNotAllowedPath(ctx.filename)) {
    return ctx.code;
  }

  return yield* transformJSXFile(ctx.code);
});

const runBabelTransform: BabelTransformerFn = async (params) => {
  // console.log(inspect(params.options, false, null, true));
  return runTwinTransform.pipe(
    Effect.provide(
      MetroCompilerContext.make(params, {
        componentID: true,
        styledProps: true,
        templateStyles: true,
        tree: true,
        order: true,
      }),
    ),
    Effect.provide(NativeTwinService.make(params.options)),
    Effect.map((code) => {
      // @ts-expect-error
      return upstreamTransformer.transform({
        src: code,
        options: params.options,
        filename: params.filename,
      });
    }),
  );
};
