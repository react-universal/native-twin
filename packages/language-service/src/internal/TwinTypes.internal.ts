import type { __Theme__, RuntimeTW, TailwindConfig, ThemeContext } from '@native-twin/core';
import type { SheetEntry } from '@native-twin/css';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import type { PlatformOSType } from 'react-native';

export type InternalTwinConfig = TailwindConfig<__Theme__ & TailwindPresetTheme>;
export type InternalTwFn = RuntimeTW<InternalTwinConfig['theme'], SheetEntry[]>;
export type InternalTwinThemeContext = ThemeContext<TailwindPresetTheme>;
export type AnyInternalTwinRule = InternalTwFn['config']['rules'][number];
export type AnyInternalTwinThemeKey = AnyInternalTwinRule[1] | (string & {});

export type Units = {
  '%'?: number;
  vw?: number;
  vh?: number;
  vmin?: number;
  vmax?: number;
  em: number;
  rem: number;
  px: number;
  pt: number;
  pc: number;
  in: number;
  cm: number;
  mm: number;
};

export type BuildStyledContext = {
  orientation: 'portrait' | 'landscape';
  resolution: number;
  fontScale: number;
  deviceWidth: number;
  deviceHeight: number;
  deviceAspectRatio: number;
  platform: PlatformOSType;
  colorScheme: 'dark' | 'light';
  units: Units;
};
