import {
  AnyStyle,
  CompleteStyle,
  FinalSheet,
  getRuleSelectorGroup,
  SheetEntryDeclaration,
} from '@native-twin/css';
import { StyleSheet } from 'react-native';
import { parseCssValue, tw } from '@native-twin/core';
import { RuntimeSheetEntry } from '@native-twin/css/jsx';
import type { StyledContext } from '../store/observables';

export const sheetEntryToStyle = (
  entry: RuntimeSheetEntry,
  context: StyledContext,
): CompleteStyle | null => {
  const validRule = isApplicativeRule(entry.selectors, context);
  if (!validRule) return null;
  const nextDecl = composeDeclarations(entry.declarations, context);
  return nextDecl;
};

export const sheetEntriesToStyles = (
  entries: RuntimeSheetEntry[],
  context: StyledContext,
): CompleteStyle => {
  return entries.reduce((prev, current) => {
    const style = sheetEntryToStyle(current, context);
    if (!style) return prev;

    if (style && style.transform) {
      style.transform = [...(style.transform as any), ...style.transform];
    }
    return {
      ...prev,
      ...style,
    };
  }, {} as AnyStyle);
};
export function getSheetEntryStyles(
  entries: RuntimeSheetEntry[] = [],
  context: StyledContext,
) {
  return entries.reduce(
    (prev, current) => {
      const nextDecl = sheetEntryToStyle(current, context);
      if (!nextDecl) return prev;

      const group = getRuleSelectorGroup(current.selectors);
      if (nextDecl.transform && prev[group].transform) {
        nextDecl.transform = [...(prev[group].transform as any), ...nextDecl.transform];
      }
      Object.assign(prev[group], StyleSheet.flatten([prev[group], nextDecl]));
      return prev;
    },
    {
      base: StyleSheet.create({}),
      even: StyleSheet.create({}),
      first: StyleSheet.create({}),
      group: StyleSheet.create({}),
      last: StyleSheet.create({}),
      odd: StyleSheet.create({}),
      pointer: StyleSheet.create({}),
      dark: StyleSheet.create({}),
    } as FinalSheet,
  );
}

export function composeDeclarations(
  declarations: SheetEntryDeclaration[],
  context: StyledContext,
) {
  const styledCtx = {
    rem: context.units.rem,
    deviceHeight: context.deviceHeight,
    deviceWidth: context.deviceWidth,
  };
  return declarations.reduce((prev, current) => {
    let value: any = current.value;
    if (Array.isArray(current.value)) {
      value = [];
      for (const t of current.value) {
        if (typeof t.value === 'string') {
          if (t.value) {
            value.push({
              [t.prop]: parseCssValue(t.prop, t.value, styledCtx),
            });
          }
        }
      }
      Object.assign(prev, {
        transform: [...(prev['transform'] ?? []), ...value],
      });
      return prev;
    }
    if (typeof value === 'string') {
      value = parseCssValue(current.prop, value, styledCtx);
    }
    if (typeof value === 'object') {
      Object.assign(prev, value);
    } else {
      Object.assign(prev, {
        [current.prop]: value,
      });
    }

    return prev;
  }, {} as AnyStyle);
}

const platformVariants = ['web', 'native', 'ios', 'android'];
export function isApplicativeRule(variants: string[], context: StyledContext) {
  if (variants.length === 0) return true;
  const screens = tw.theme('screens');

  for (let v of variants) {
    v = v.replace('&:', '');
    if (platformVariants.includes(v)) {
      if (v === 'web' && context.platform !== 'web') return false;
      if (v === 'native' && context.platform === 'web') return false;
      if (v === 'ios' && context.platform !== 'ios') return false;
      if (v === 'android' && context.platform !== 'android') return false;
      // if (v === 'web' && Platform.OS !== 'web') return false;
      // if (v === 'native' && Platform.OS === 'web') return false;
      // if (v === 'ios' && Platform.OS !== 'ios') return false;
      // if (v === 'android' && Platform.OS !== 'android') return false;
    }
    // if (
    //   (v ==== 'dark' && context.colorScheme ==== 'light') ||
    //   (v ==== 'light' && context.colorScheme ==== 'dark')
    // ) {
    //   return false;
    // }
    if (screens && v in screens) {
      const variant = screens[v];
      const width = context.deviceWidth;
      if (typeof variant === 'string') {
        const value = parseCssValue('min-width', variant, {
          deviceHeight: context.deviceHeight,
          deviceWidth: context.deviceWidth,
          rem: context.units.rem,
        }) as number;
        if (width >= Number(value)) {
          return false;
        }
      }

      if (typeof variant === 'object') {
        let min: null | number = null;
        let max: null | number = null;
        // if ('raw' in variant && !(width >= Number(variant.raw))) {
        if ('raw' in variant) {
          min = parseCssValue('min-width', variant.raw, {
            deviceHeight: context.deviceHeight,
            deviceWidth: context.deviceWidth,
            rem: context.units.rem,
          }) as number;
        }
        if ('min' in variant && variant.min) {
          min = parseCssValue('min-width', variant.min, {
            deviceHeight: context.deviceHeight,
            deviceWidth: context.deviceWidth,
            rem: context.units.rem,
          }) as number;
        }
        if ('max' in variant && variant.max) {
          max = parseCssValue('max-width', variant.max, {
            deviceHeight: context.deviceHeight,
            deviceWidth: context.deviceWidth,
            rem: context.units.rem,
          }) as number;
        }
        if (max && min && !(width <= max && width >= min)) {
          return false;
        }
        if (max && !(width <= max)) return false;
        if (min && !(width >= min)) return false;
      }
    }
  }
  return true;
}
