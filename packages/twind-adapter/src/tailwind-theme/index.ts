import type { Preset } from '@twind/core';
import presetTailwindBase from './base';
import * as colors from './colors';
import type { TailwindTheme } from './types';

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
