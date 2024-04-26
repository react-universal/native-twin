import * as Effect from 'effect/Effect';
import * as Ref from 'effect/Ref';
import {
  __Theme__,
  createTailwind,
  createThemeContext,
  defineConfig,
  RuntimeTW,
  TailwindConfig,
  ThemeContext,
} from '@native-twin/core';
import { createVirtualSheet, SheetEntry } from '@native-twin/css';
import { presetTailwind } from '@native-twin/preset-tailwind';
import { TailwindPresetTheme } from '@native-twin/preset-tailwind/build/types/theme.types';
import { requireJS } from '../utils/load-js';

export type InternalTwinConfig = TailwindConfig<__Theme__ & TailwindPresetTheme>;
export type InternalTwFn = RuntimeTW<__Theme__ & TailwindPresetTheme, SheetEntry[]>;
export type InternalTwinThemeContext = ThemeContext<__Theme__ & TailwindPresetTheme>;

export interface NativeTwinHandler {
  config: InternalTwinConfig;
  tw: InternalTwFn;
  context: InternalTwinThemeContext;
}

export class NativeTwinHandlerResource {
  get: Effect.Effect<NativeTwinHandler>;

  constructor(readonly clientConfig: Ref.Ref<NativeTwinHandler>) {
    this.get = Ref.get(this.clientConfig);
  }

  set(newConfig: NativeTwinHandler) {
    return Ref.update(this.clientConfig, () => newConfig);
  }
}

export const createTwin = (
  configFilePath: string | undefined = undefined,
): NativeTwinHandler => {
  const file = configFilePath ? requireJS(configFilePath) : null;

  if (!configFilePath || !file) {
    const userConfig = defineConfig({
      content: [],
      presets: [presetTailwind()],
    });
    const tw = createTailwind(userConfig, createVirtualSheet());
    return {
      config: userConfig,
      tw,
      context: createThemeContext(userConfig),
    };
  }

  const userConfig = defineConfig(file);
  const tw = createTailwind(userConfig, createVirtualSheet());
  return {
    config: userConfig,
    tw,
    context: createThemeContext(userConfig),
  };
};

export const make = Effect.map(
  Ref.make(createTwin()),
  (value) => new NativeTwinHandlerResource(value),
);
