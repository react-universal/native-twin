import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import worker from 'metro-transform-worker';
import micromatch from 'micromatch';
import path from 'node:path';
import type { __Theme__, RuntimeTW, TailwindConfig } from '@native-twin/core';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import { ensureBuffer } from '../utils';
import type { TransformWorkerArgs, TwinTransformFn } from './transformer.types';

export class MetroTransformerContext extends Context.Tag('MetroTransformerContext')<
  MetroTransformerContext,
  TransformWorkerArgs & {
    twin: RuntimeTW;
    twinConfig: TailwindConfig<__Theme__ & TailwindPresetTheme>;
    allowedPaths: string[];
  }
>() {}

export class MetroTransformerService extends Context.Tag('MetroTransformerService')<
  MetroTransformerService,
  {
    isNotAllowedPath(): boolean;
    transform(
      code: Buffer | string,
      useDefaultTransformer: boolean,
    ): Promise<worker.TransformResponse>;
  }
>() {}

export const MetroTransformerServiceLive = Layer.effect(
  MetroTransformerService,
  Effect.gen(function* () {
    const { filename, projectRoot, config, options, allowedPaths } =
      yield* MetroTransformerContext;
    const transformer: TwinTransformFn = config.transformerPath
      ? require(config.transformerPath).transform
      : worker.transform;

    return {
      isNotAllowedPath: () => {
        return !micromatch.isMatch(path.resolve(projectRoot, filename), allowedPaths);
      },
      transform: (code: Buffer | string, useDefaultTransformer) => {
        if (useDefaultTransformer) {
          return transformer(config, projectRoot, filename, ensureBuffer(code), options);
        }
        return worker.transform(
          config,
          projectRoot,
          filename,
          ensureBuffer(code),
          options,
        );
      },
    };
  }),
);
