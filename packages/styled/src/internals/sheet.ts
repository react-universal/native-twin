import { Platform } from 'react-native';
import { AnyStyle, CssResolver, FinalSheet } from '@universal-labs/css';
import { hash, initialize, parse } from '@universal-labs/twind-adapter';
import type { Config } from 'tailwindcss';
import { SheetInteractionState, SheetInterpreterFn, SheetManagerFn } from '../types/css.types';
import { contextStore } from './store/context.store';

const platformMatch = /web|ios|android|native+/;

export const SheetManager: SheetManagerFn = (context) => {
  const virtualSheet = new Map<string, any>();
  // let currentConfig: Config = { content: ['_'] };

  function getStyles(sheet: FinalSheet, input: SheetInteractionState) {
    const styles: AnyStyle = { ...sheet.base };
    if (input.isPointerActive) Object.assign(styles, { ...sheet.pointer });
    if (input.isParentActive) Object.assign(styles, { ...sheet.group });
    return styles;
  }

  function getChildStyles(
    sheet: FinalSheet,
    input: {
      isFirstChild: boolean;
      isLastChild: boolean;
      isEven: boolean;
      isOdd: boolean;
    },
  ) {
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

  const sheetFn: SheetInterpreterFn = (classNames) => {
    const utilities = parse(classNames);
    const hashed = hash(classNames);
    const isCached = virtualSheet.has(hashed);
    if (isCached) {
      console.log('CACHED: ', isCached);
      return virtualSheet.get(hashed)!;
    }
    // const test = SheetManager.twind.tw.theme('color-blue-200');
    // const test = SheetManager.twind.tw.theme('aria');
    console.log('UTILITIES: ', utilities);
    const restore = SheetManager.twind.tw.snapshot();
    const generateClassNames = SheetManager.twind.tx(classNames).split(' ');
    const target = SheetManager.twind.tw.target;
    const purged = target.filter((item) =>
      platformMatch.test(item) ? item.includes(Platform.OS) : true,
    );
    const finalSheet = CssResolver(purged, {
      deviceHeight: context.deviceHeight,
      deviceWidth: context.deviceHeight,
      rem: context.units.rem,
      platform: Platform.OS,
    });
    restore();
    const result: ReturnType<SheetInterpreterFn> = {
      finalSheet,
      getStyles: (input) => getStyles(finalSheet, input),
      getChildStyles: (data) => getChildStyles(finalSheet, data),
      metadata: {
        isGroupParent: generateClassNames.includes('group'),
        hasPointerEvents: Object.keys(finalSheet.pointer).length > 0,
        hasGroupEvents: Object.keys(finalSheet.group).length > 0,
      },
    };
    virtualSheet.set(hashed, result);
    return result;
  };

  return sheetFn;
};

SheetManager.twind = initialize();

SheetManager.setThemeConfig = (config: Config, baseRem) => {
  contextStore.setState((prev) => ({
    ...prev,
    units: {
      ...prev.units,
      em: baseRem,
      rem: baseRem,
    },
  }));
  SheetManager.twind.tw.destroy();
  //@ts-expect-error
  SheetManager.twind = undefined;
  SheetManager.twind = initialize({
    colors: {
      ...config?.theme?.colors,
    },
    fontFamily: {
      ...config?.theme?.fontFamily,
    },
  });
};
