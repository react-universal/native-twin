import type { Preset } from '../types/config.types';
import type { __Theme__ } from '../types/theme.types';
import { themeRules } from './tailwind-rules';
import * as tailwindTheme from './tailwind-theme';

export interface TailwindPresetBaseOptions {
  colors?: __Theme__['colors'];
  /** Allows to disable to tailwind preflight (default: `false` eg include the tailwind preflight ) */
  disablePreflight?: boolean | undefined;
}

export function presetTailwind({ colors }: TailwindPresetBaseOptions = {}): Preset<__Theme__> {
  let userColors: __Theme__['colors'] = {};
  if (colors) {
    userColors = {
      inherit: 'inherit',
      current: 'currentColor',
      transparent: 'transparent',
      black: '#000',
      white: '#fff',
      ...colors,
    };
  } else {
    userColors = tailwindTheme.colors;
  }
  return {
    // allow other preflight to run
    // preflight: disablePreflight ? undefined : preflightBase,
    theme: {
      ...tailwindTheme,
      ...tailwindTheme.theme,
      colors: {
        ...userColors,
      },
    },
    rules: themeRules,
  };
}
