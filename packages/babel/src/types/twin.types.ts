import { __Theme__, RuntimeTW } from '@native-twin/core';
import { SelectorGroup, SheetEntry } from '@native-twin/css';
import { TailwindPresetTheme } from '@native-twin/preset-tailwind';

export interface PartialRule extends SheetEntry {
  group: SelectorGroup;
}

export type InternalTwinConfig = __Theme__ & TailwindPresetTheme;
export type InternalTwFn = RuntimeTW<InternalTwinConfig, SheetEntry[]>;
