import { PixelRatio, Platform } from 'react-native';
import { parseCssValue, tw } from '@native-twin/core';
import {
  AnyStyle,
  FinalSheet,
  getRuleSelectorGroup,
  SheetEntry,
  SheetEntryDeclaration,
} from '@native-twin/css';
import { StyledContext } from '@native-twin/styled';
import { colorScheme, rem, vh, vw } from '../observables';

export function getSheetEntryStyles(entries: SheetEntry[] = [], context: StyledContext) {
  return entries.reduce(
    (prev, current) => {
      const validRule = isApplicativeRule(current.selectors, context);
      if (!validRule) return prev;
      const nextDecl = composeDeclarations(current.declarations, context);
      const group = getRuleSelectorGroup(current.selectors);
      if (nextDecl.transform && prev[group].transform) {
        nextDecl.transform = [...(prev[group].transform as any), ...nextDecl.transform];
      }
      Object.assign(prev[group], nextDecl);
      return prev;
    },
    {
      base: {},
      even: {},
      first: {},
      group: {},
      last: {},
      odd: {},
      pointer: {},
      dark: {},
    } as FinalSheet,
  );
}

export function composeDeclarations(
  declarations: SheetEntryDeclaration[],
  context: StyledContext,
) {
  return declarations.reduce((prev, current) => {
    let value: any = current.value;
    if (Array.isArray(current.value)) {
      value = [];
      for (const t of current.value) {
        if (typeof t.value == 'string') {
          value.push({
            [t.prop]: parseCssValue(t.prop, t.value, {
              rem: tw.config.root?.rem ?? context.units.rem,
              deviceHeight: context.deviceHeight,
              deviceWidth: context.deviceWidth,
            }),
          });
        }
      }
      Object.assign(prev, {
        transform: [...(prev['transform'] ?? []), ...value],
      });
      return prev;
    }
    if (typeof value == 'string') {
      value = parseCssValue(current.prop, value, {
        rem: tw.config.root?.rem ?? context.units.rem,
        deviceHeight: context.deviceHeight,
        deviceWidth: context.deviceWidth,
      });
    }
    if (typeof value == 'object') {
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
  if (variants.length == 0) return true;
  const screens = tw.theme('screens');

  for (let v of variants) {
    v = v.replace('&:', '');
    if (platformVariants.includes(v)) {
      if (v == 'web' && Platform.OS != 'web') return false;
      if (v == 'native' && Platform.OS == 'web') return false;
      if (v == 'ios' && Platform.OS != 'ios') return false;
      if (v == 'android' && Platform.OS != 'android') return false;
    }
    // if (
    //   (v === 'dark' && context.colorScheme === 'light') ||
    //   (v === 'light' && context.colorScheme === 'dark')
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

      if (typeof variant == 'object') {
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

export function createStyledContext(): StyledContext {
  const vh$ = vh.get();
  const vw$ = vw.get();
  return {
    colorScheme: colorScheme.get()!,
    deviceAspectRatio: vw$ / vh$,
    deviceHeight: vh$,
    deviceWidth: vw$,
    orientation: vw$ > vh$ ? 'landscape' : 'portrait',
    resolution: PixelRatio.getPixelSizeForLayoutSize(vw$),
    fontScale: PixelRatio.getFontScale(),
    platform: Platform.OS,
    units: {
      rem: rem.get(),
      em: rem.get(),
      cm: 37.8,
      mm: 3.78,
      in: 96,
      pt: 1.33,
      pc: 16,
      px: 1,
      vmin: vw$ < vh$ ? vw$ : vh$,
      vmax: vw$ > vh$ ? vw$ : vh$,
      vw: vw$,
      vh: vh$,
    },
  };
}
