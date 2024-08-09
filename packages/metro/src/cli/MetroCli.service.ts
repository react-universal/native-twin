import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import type { RuntimeTW, TailwindConfig, __Theme__ } from '@native-twin/core';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import { MetroConfigInternal } from '../metro.types';

export interface MetroConfigContextShape extends MetroConfigInternal {
  dev: boolean;
  hot: boolean;
  outputDir: string;
  twinCacheFile: string;
  twConfig: TailwindConfig<__Theme__ & TailwindPresetTheme>;
  platform: string;
  twin: RuntimeTW;
}

export class MetroConfigContext extends Context.Tag('config/MetroConfigContext')<
  MetroConfigContext,
  MetroConfigContextShape
>() {}

export const makeLive = (config: MetroConfigContextShape) =>
  Layer.scoped(
    MetroConfigContext,
    Effect.gen(function* () {
      return config;
    }),
  );
