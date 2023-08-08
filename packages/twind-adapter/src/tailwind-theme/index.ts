import type { Preset } from '@universal-labs/twind-native';
import type { TailwindTheme } from './types';

import presetTailwindBase from './base';
import * as colors from './colors';

export * from './types';

export interface TailwindPresetOptions {
  /** Allows to disable to tailwind preflight (default: `false` eg include the tailwind preflight ) */
  disablePreflight?: boolean | undefined;
}

export function presetTailwind({
  disablePreflight,
}: TailwindPresetOptions = {}): Preset<TailwindTheme> {
  return presetTailwindBase({ colors, disablePreflight });
}
