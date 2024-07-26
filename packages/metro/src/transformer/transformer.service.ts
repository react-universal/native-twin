import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import worker from 'metro-transform-worker';
import micromatch from 'micromatch';
import path from 'node:path';
import type { __Theme__, TailwindConfig } from '@native-twin/core';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import { ensureBuffer } from '../utils/file.utils';
import { getTwinConfig } from '../utils/load-config';
import type { TransformWorkerArgs, TwinTransformFn } from './transformer.types';

export class MetroTransformerContext extends Context.Tag('MetroTransformerContext')<
  MetroTransformerContext,
  TransformWorkerArgs
>() {}

export class MetroTransformerService extends Context.Tag('MetroTransformerService')<
  MetroTransformerService,
  {
    isNotAllowedPath(): boolean;
    getTwinConfig(): TailwindConfig<__Theme__ & TailwindPresetTheme>;
    transform(
      code: Buffer | string,
      useDefaultTransformer: boolean,
    ): Promise<worker.TransformResponse>;
  }
>() {}

export const MetroTransformerServiceLive = Layer.effect(
  MetroTransformerService,
  Effect.gen(function* () {
    const { filename, projectRoot, config, options } = yield* MetroTransformerContext;
    const transformer: TwinTransformFn = config.transformerPath
      ? require(config.transformerPath).transform
      : worker.transform;

    const { allowedPaths, twinConfig } = getTwinConfig(projectRoot);
    return {
      getTwinConfig: () => {
        return twinConfig;
      },
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
