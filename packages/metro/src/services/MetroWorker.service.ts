import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import fsAsync from 'fs/promises';
import worker from 'metro-transform-worker';
import type { NativeTwinTransformerOpts } from '@native-twin/babel/models';
import { MetroCompilerContext, NativeTwinService } from '@native-twin/babel/services';
import { ensureBuffer } from '@native-twin/helpers/server';
import type { MetroWorkerInput } from './models/metro.models';
import { metroWorkerInputToCompilerCtx } from './utils/metroWorker.maps';

export class MetroWorkerService extends Context.Tag('metro/worker/context')<
  MetroWorkerService,
  {
    input: MetroWorkerInput;
    config: {
      cssOutput: string;
      isReactServer: boolean;
      isServer: boolean;
      clientBoundaries: string[];
      dom: string;
      isCSS: boolean;
      isClientEnvironment: boolean;
      isWeb: boolean;
    };
    readCSSOutput: Effect.Effect<string>;
    runWorker: (config: MetroWorkerInput) => Effect.Effect<worker.TransformResponse>;
    getPlatformOutput: (platform: string) => string;
  }
>() {
  static make = (input: MetroWorkerInput) =>
    Layer.scoped(MetroWorkerService, createWorkerService(input));
}

type MetroTransformFn = typeof worker.transform;
export const createWorkerService = (input: MetroWorkerInput) => {
  return Effect.gen(function* () {
    const { options, filename, config } = input;
    const cssOutput =
      config.platformOutputs.find((x) =>
        x.includes(`${options.platform ?? 'native'}.`),
      ) ?? config.outputCSS;
    const platformOutputs = config.platformOutputs;
    const environment = options.customTransformOptions?.environment;
    const clientBoundaries = options.customTransformOptions?.clientBoundaries ?? [];
    const dom = options.customTransformOptions?.dom;
    const isClientEnvironment = environment !== 'node' && environment !== 'react-server';
    const isCSS = options.type !== 'asset' && /\.(s?css|sass)$/.test(filename);
    const isServer = environment === 'node' || environment === 'react-server';
    const isReactServer = environment === 'react-server';
    const isWeb = options.platform === 'web';
    const transform: MetroTransformFn = input.config.originalTransformerPath
      ? require(input.config.originalTransformerPath).transform
      : worker.transform;

    return {
      input,
      config: {
        isWeb,
        cssOutput,
        isReactServer,
        isServer,
        clientBoundaries,
        dom,
        isCSS,
        isClientEnvironment,
      },
      readCSSOutput: readCSSOutput(cssOutput),
      getPlatformOutput: (platform: string) => {
        return (
          platformOutputs.find((x) => x.includes(`${platform}.`)) ?? 'twin.css.native.js'
        );
      },
      runWorker: (config) =>
        Effect.promise(() =>
          transform(
            config.config,
            config.projectRoot,
            config.filename,
            config.data,
            config.options,
          ),
        ),
    } as MetroWorkerService['Type'];
  });
};

const readCSSOutput = (cssOutput: string) =>
  Effect.promise(() => {
    // setupCssOutput(cssOutput);
    return fsAsync.readFile(cssOutput, { encoding: 'utf-8' });
  });

export const makeWorkerLayers = (
  config: NativeTwinTransformerOpts,
  projectRoot: string,
  filename: string,
  data: Buffer | string,
  options: worker.JsTransformOptions,
) => {
  const ctx = metroWorkerInputToCompilerCtx({
    config,
    projectRoot,
    filename,
    data: ensureBuffer(data),
    options,
  });
  return pipe(
    MetroCompilerContext.make(ctx.options, ctx.generate),
    Layer.provideMerge(
      NativeTwinService.make({
        dev: options.dev,
        platform: options.platform ?? 'native',
        projectRoot,
      }),
    ),
    Layer.provideMerge(
      MetroWorkerService.make({
        config,
        data: ensureBuffer(data),
        filename,
        options,
        projectRoot,
      }),
    ),
  );
};
