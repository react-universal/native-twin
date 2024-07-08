import { ColorSchemeName, StyleSheet as NativeSheet } from 'react-native';
import { tw } from '@native-twin/core';
import {
  AnyStyle,
  GetChildStylesArgs,
  SheetEntry,
  SheetInteractionState,
} from '@native-twin/css';
import { INTERNAL_FLAGS, INTERNAL_RESET } from '../constants';
import { StyledContext, styledContext } from '../store/observables/styles.obs';
import { twinConfigObservable } from '../store/observables/twin.observer';
import { globalStyles } from '../store/styles.store';
import { getSheetEntryStyles } from '../utils/sheet.utils';
import { TwinStyleSheet } from './sheet.types';

const internalSheet: TwinStyleSheet = {
  [INTERNAL_FLAGS]: {},
  [INTERNAL_RESET]() {
    globalStyles.clear();
    twinConfigObservable.set(tw.config);
  },
  getFlag(name: string) {
    return this[INTERNAL_FLAGS][name];
  },
  getGlobalStyle(name) {
    return globalStyles.get(name);
  },
  compile(tokens) {
    const entries = tw(tokens);
    return getSheetEntryStyles(entries, styledContext.get());
  },
  entriesToFinalSheet(entries) {
    return getSheetEntryStyles(entries, styledContext.get());
  },
  registerClassNames(source: string) {
    const entries = tw(`${source}`);
    return entries;
  },
  styles: new Map(),
};

export const StyleSheet = Object.assign({}, internalSheet, NativeSheet);

export function createComponentSheet(entries: SheetEntry[] = [], context: StyledContext) {
  const sheet = StyleSheet.create(getSheetEntryStyles(entries, context));
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

  function getStyles(input: SheetInteractionState, theme: ColorSchemeName) {
    const styles: AnyStyle = { ...sheet.base };
    if (theme === 'dark') {
      Object.assign(styles, { ...sheet.dark });
    }
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

export type ComponentSheet = ReturnType<typeof createComponentSheet>;
