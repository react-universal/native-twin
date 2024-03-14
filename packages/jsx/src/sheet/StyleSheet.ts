import { Appearance, Dimensions, StyleSheet as NativeSheet } from 'react-native';
import { tw } from '@native-twin/core';
import {
  AnyStyle,
  GetChildStylesArgs,
  SheetEntry,
  SheetInteractionState,
} from '@native-twin/css';
import { StyledContext } from '@native-twin/styled';
import { INTERNAL_FLAGS, INTERNAL_RESET } from '../constants';
import { colorScheme, rem, vh, vw } from '../observables';
import { warned, warnings } from '../store/static.store';
import { globalStyles } from '../store/styles.store';
import { createStyledContext, getSheetEntryStyles } from '../utils/sheet.utils';
import { TwinStyleSheet } from './sheet.types';

const internalSheet: TwinStyleSheet = {
  [INTERNAL_FLAGS]: {},
  [INTERNAL_RESET]({ dimensions = Dimensions, appearance = Appearance } = {}) {
    globalStyles.clear();
    warnings.clear();
    warned.clear();

    rem.set(tw.config.root.rem ?? 16);

    vw[INTERNAL_RESET](dimensions);
    vh[INTERNAL_RESET](dimensions);
    colorScheme[INTERNAL_RESET](appearance);
  },
  getFlag(name: string) {
    return this[INTERNAL_FLAGS][name];
  },
  getGlobalStyle(name) {
    return globalStyles.get(name);
  },
  get runtimeContext() {
    return createStyledContext();
  },
};

export const StyleSheet = Object.assign({}, internalSheet, NativeSheet);

export function createComponentSheet(entries: SheetEntry[] = [], context: StyledContext) {
  const sheet = getSheetEntryStyles(entries, context);
  return {
    getChildStyles,
    getStyles,
    sheet,
    metadata: {
      isGroupParent: entries.some((x) => x.className == 'group'),
      hasGroupEvents: Object.keys(sheet.group).length > 0,
      hasPointerEvents: Object.keys(sheet.pointer).length > 0,
    },
  };
  function getStyles(input: SheetInteractionState) {
    const styles: AnyStyle = { ...sheet.base };
    if (input.isPointerActive) Object.assign(styles, { ...sheet.pointer });
    if (input.isParentActive) Object.assign(styles, { ...sheet.group });
    return styles;
  }

  function getChildStyles(input: GetChildStylesArgs) {
    const result: AnyStyle = {};
    if (input.isFirstChild) {
      Object.assign(result, sheet.first);
    }
    if (input.isLastChild) {
      Object.assign(result, sheet.last);
    }
    if (input.isEven) {
      Object.assign(result, sheet.even);
    }
    if (input.isOdd) {
      Object.assign(result, sheet.odd);
    }
    return Object.freeze(result);
  }
}
