import { Context, Effect, Layer } from 'effect';
import { __Theme__, RuntimeTW } from '@native-twin/core';
import { SheetEntry } from '@native-twin/css';
import { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import { getUserTwinConfig, setupNativeTwin } from '../runtime';
import { TwinBabelOptions } from '../types/plugin.types';

export class TransformerContext extends Context.Tag('transformer/context')<
  TransformerContext,
  {
    rootPath: string;
    options: TwinBabelOptions;
    twin: RuntimeTW<__Theme__ & TailwindPresetTheme, SheetEntry[]>;
  }
>() {}

export const make = (options: TwinBabelOptions, rootPath: string) =>
  Layer.scoped(
    TransformerContext,
    Effect.gen(function* () {
      const twConfig = getUserTwinConfig(rootPath, options);
      const twin = setupNativeTwin(twConfig, options);
      return {
        options,
        rootPath,
        twin,
        twConfig: twin.config,
      };
    }),
  );
