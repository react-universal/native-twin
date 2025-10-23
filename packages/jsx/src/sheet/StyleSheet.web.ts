import type { TwinRuntimeContext } from '@native-twin/core';
import type { SheetEntry } from '@native-twin/css';
import { INTERNAL_FLAGS, INTERNAL_RESET } from '../utils/constants';
import type { TwinStyleSheet } from './StyleSheet.types';

// TODO: Check this on every react web fmw
const internalSheet = {
  [INTERNAL_FLAGS]: {},
  [INTERNAL_RESET]() {
    // vw[INTERNAL_RESET](dimensions);
    // vh[INTERNAL_RESET](dimensions);
    // colorScheme[INTERNAL_RESET](appearance);
  },
  getFlag(name: string) {
    return this[INTERNAL_FLAGS][name];
  },
  getGlobalStyle(_name: string) {
    return undefined;
  },
  get runtimeContext() {
    return {};
  },
  create(a: any) {
    return a;
  },
} as any as TwinStyleSheet;

export const StyleSheet = Object.assign({}, internalSheet) as any as TwinStyleSheet;

export function createComponentSheet(_entries: SheetEntry[] = [], _context: TwinRuntimeContext) {}

export type ComponentSheet = ReturnType<typeof createComponentSheet>;
