import { SheetEntry } from '@native-twin/css';
import { StyledContext } from '@native-twin/styled';
import { INTERNAL_FLAGS, INTERNAL_RESET } from '../constants';
import { TwinStyleSheet } from './sheet.types';

// TODO: Check this on every react web fmw
const internalSheet: TwinStyleSheet = {
  [INTERNAL_FLAGS]: {},
  [INTERNAL_RESET]({ dimensions, appearance } = {}) {

    // vw[INTERNAL_RESET](dimensions);
    // vh[INTERNAL_RESET](dimensions);
    // colorScheme[INTERNAL_RESET](appearance);
  },
  getFlag(name: string) {
    return this[INTERNAL_FLAGS][name];
  },
  getGlobalStyle(name) {
    return undefined;
  },
  // @ts-expect-error
  get runtimeContext() {
    return {};
  },
  create(a: any) {
    return a;
  },
};

export const StyleSheet = Object.assign({}, internalSheet);

export function createComponentSheet(
  entries: SheetEntry[] = [],
  context: StyledContext,
) {}

export type ComponentSheet = ReturnType<typeof createComponentSheet>;
