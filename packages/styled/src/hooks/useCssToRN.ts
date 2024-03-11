import { useId, useMemo } from 'react';
import { Platform } from 'react-native';
import {
  AnyStyle,
  FinalSheet,
  GetChildStylesArgs,
  SheetInteractionState,
  SheetEntry,
  SheetEntryDeclaration,
  getRuleSelectorGroup,
} from '@universal-labs/css';
import { parseCssValue, tw } from '@universal-labs/native-twin';
import { StyledContext } from '../types/css.types';
import { useStyledContext } from './useStyledContext';

export function useCssToRN(className: string) {
  const componentID = useId();
  const { context } = useStyledContext();
  const stylesheet = useMemo(() => {
    return createComponentSheet(tw(className), context);
  }, [className, context]);

  return { stylesheet, componentID };
}

export function createComponentSheet(entries: SheetEntry[], context: StyledContext) {
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

function getSheetEntryStyles(entries: SheetEntry[], context: StyledContext) {
  return entries.reduce(
    (prev, current) => {
      const validRule = isApplicativeRule(current.selectors, context);
      if (!validRule) return prev;
      let nextDecl = composeDeclarations(current.declarations, context);
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
    } as FinalSheet,
  );
}

function composeDeclarations(declarations: SheetEntryDeclaration[], context: StyledContext) {
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
function isApplicativeRule(variants: string[], context: StyledContext) {
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
