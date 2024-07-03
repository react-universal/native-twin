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
    if (v in screens) {
      tw.theme('screens');
      const width = context.deviceWidth;
      const value = screens[v].replace('px', '');
      if (typeof value == 'string' && width >= Number(value)) {
        return false;
      }
      if (typeof value == 'object') {
        if ('raw' in value && !(width >= value.raw)) {
          return false;
        }
        if (value.max && value.min && !(width <= value.max && width >= value.min))
          return false;
        if (value.max && !(width <= value.max)) return false;
        if (value.min && !(width >= value.min)) return false;
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
