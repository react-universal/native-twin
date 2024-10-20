import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import worker from 'metro-transform-worker';
import { ensureBuffer } from '@native-twin/helpers/server';
import type { MetroWorkerInput, NativeTwinTransformerOpts } from '../models/metro.models';

export class MetroWorkerService extends Context.Tag('metro/worker/context')<
  MetroWorkerService,
  {
    input: MetroWorkerInput;
    runWorker: (config: MetroWorkerInput) => Effect.Effect<worker.TransformResponse>;
  }
>() {
  static make = (input: MetroWorkerInput) =>
    Layer.scoped(MetroWorkerService, createWorkerService(input));
}

type MetroTransformFn = typeof worker.transform;
export const createWorkerService = (input: MetroWorkerInput) => {
  return Effect.gen(function* () {
    const transform: MetroTransformFn = input.config.originalTransformerPath
      ? require(input.config.originalTransformerPath).transform
      : worker.transform;

    return {
      input,
      runWorker: (config) =>
        Effect.promise(() =>
          transform({
            ...config.config,
          }, config.projectRoot, config.filename, config.data, {
            ...config.options,
            customTransformOptions: {
              ...config.options.customTransformOptions,
              outputCSS: input.config.outputCSS,
            },
          }),
        ),
    } as MetroWorkerService['Type'];
  });
};

export const makeWorkerLayers = (
  config: NativeTwinTransformerOpts,
  projectRoot: string,
  filename: string,
  data: Buffer | string,
  options: worker.JsTransformOptions,
) => {
  return MetroWorkerService.make({
    config,
    data: ensureBuffer(data),
    filename,
    options,
    projectRoot,
  });
  // MetroCompilerContext.make(ctx.options, ctx.generate),
};
