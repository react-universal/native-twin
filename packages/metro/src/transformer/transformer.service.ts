import upstreamTransformer from '@expo/metro-config/babel-transformer';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import micromatch from 'micromatch';
import path from 'node:path';
import { __Theme__, TailwindConfig } from '@native-twin/core';
import { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import { TwinTransformerOptions } from '../types/transformer.types';
import { getUserNativeWindConfig } from '../utils/load-config';

interface TransformerContext {
  getTwinConfig(): TailwindConfig<__Theme__ & TailwindPresetTheme>;
  transform(data: TwinTransformerOptions): any;
  isNotAllowedPath(): boolean;
}

export class MetroTransformContext extends Context.Tag('metro/MetroTransformService')<
  MetroTransformContext,
  TwinTransformerOptions
>() {}

export class TransformerService extends Context.Tag('babel/TransformerService')<
  TransformerService,
  TransformerContext
>() {}

export const TransformerServiceLive = Layer.effect(
  TransformerService,
  Effect.gen(function* () {
    const { options, filename } = yield* MetroTransformContext;
    const twinConfig = getUserNativeWindConfig(
      path.resolve(options.projectRoot, 'tailwind.config.ts'),
      path.join(options.projectRoot, '.twin-cache'),
    );
    const allowedPaths = twinConfig.content.map((x) =>
      path.resolve(options.projectRoot, x),
    );
    return {
      getTwinConfig: () => {
        return twinConfig;
      },
      isNotAllowedPath: () => {
        return !micromatch.isMatch(
          path.resolve(options.projectRoot, filename),
          allowedPaths,
        );
      },
      transform: (data: TwinTransformerOptions) => {
        // @ts-expect-error
        return upstreamTransformer.transform(data);
      },
    };
  }),
);
