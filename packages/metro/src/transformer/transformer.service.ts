import upstreamTransformer from '@expo/metro-config/babel-transformer';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import micromatch from 'micromatch';
import path from 'node:path';
import { __Theme__, TailwindConfig } from '@native-twin/core';
import { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import { TransformWorkerArgs, TwinTransformerOptions } from '../types/transformer.types';
import { twinHMRString } from '../utils/constants';
import { getTwinConfig } from '../utils/load-config';
import { TransformerConfig } from './transformer.config';

export class BabelTransformContext extends Context.Tag('metro/MetroTransformService')<
  BabelTransformContext,
  TwinTransformerOptions
>() {}

export class BabelTransformService extends Context.Tag('babel/BabelTransformService')<
  BabelTransformService,
  {
    getTwinConfig(): TailwindConfig<__Theme__ & TailwindPresetTheme>;
    transform(data: TwinTransformerOptions): any;
    transformCSS(css: string): any;
    isNotAllowedPath(): boolean;
  }
>() {}

export const TransformerServiceLive = Layer.effect(
  BabelTransformService,
  Effect.gen(function* () {
    const { options, filename } = yield* BabelTransformContext;
    const { allowedPaths, twinConfig } = getTwinConfig(options.projectRoot);
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
      transformCSS: (css: string) => {
        let code = css;
        if (options.dev) {
          code = `${code}\n${twinHMRString}`;
        }
        // @ts-expect-error
        return upstreamTransformer.transform({
          options,
          filename,
          src: code,
        });
      },
    };
  }),
);

export class MetroTransformerContext extends Context.Tag('MetroTransformerService')<
  MetroTransformerContext,
  TransformWorkerArgs
>() {}

export class MetroTransformerService extends Context.Tag('MetroTransformerService')<
  MetroTransformerService,
  {
    isNotAllowedPath(): boolean;
    getTwinConfig(): TailwindConfig<__Theme__ & TailwindPresetTheme>;
  }
>() {}

export const MetroTransformerServiceLive = Layer.effect(
  MetroTransformerService,
  Effect.gen(function* () {
    const { filename, projectRoot } = yield* TransformerConfig;

    const { allowedPaths, twinConfig } = getTwinConfig(projectRoot);
    return {
      getTwinConfig: () => {
        return twinConfig;
      },
      isNotAllowedPath: () => {
        return !micromatch.isMatch(path.resolve(projectRoot, filename), allowedPaths);
      },
    };
  }),
);
