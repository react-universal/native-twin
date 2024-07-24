import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import worker from 'metro-transform-worker';
import micromatch from 'micromatch';
import path from 'node:path';
import type { __Theme__, TailwindConfig } from '@native-twin/core';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import type { TransformWorkerArgs, TwinTransformFn } from '../types/transformer.types';
import { ensureBuffer } from '../utils/file.utils';
import { getTwinConfig } from '../utils/load-config';
import { TransformerConfig } from './transformer.config';

export class MetroTransformerContext extends Context.Tag('MetroTransformerService')<
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
    const { filename, projectRoot, workerArgs } = yield* TransformerConfig;
    const transformer: TwinTransformFn = workerArgs.config.transformerPath
      ? require(workerArgs.config.transformerPath).transform
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
          return transformer(
            workerArgs.config,
            projectRoot,
            filename,
            ensureBuffer(code),
            workerArgs.options,
          );
        }
        return worker.transform(
          workerArgs.config,
          projectRoot,
          filename,
          ensureBuffer(code),
          workerArgs.options,
        );
      },
    };
  }),
);
