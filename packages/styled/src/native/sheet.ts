import { Platform } from 'react-native';
import { AnyStyle, CssResolver, FinalSheet } from '@universal-labs/css';
import { hash, initialize } from '@universal-labs/twind-adapter';
import type { Config } from 'tailwindcss';
import { SheetInteractionState, SheetInterpreterFn, SheetManagerFn } from '../types/css.types';
import { globalStore } from './store';

const platformMatch = /web|ios|android|native+/;

export const SheetManager: SheetManagerFn = (context) => {
  const virtualSheet = new Map<string, any>();

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
    const interpreter = SheetManager.twind ? SheetManager.twind : initialize();
    const hashed = hash(classNames);
    const isCached = virtualSheet.has(hashed);
    if (isCached) {
      return virtualSheet.get(hashed)!;
    }
    const restore = interpreter.tw.snapshot();
    const generateClassNames = interpreter.tx(classNames).split(' ');
    const target = interpreter.tw.target;
    const purged = target.filter((item) =>
      platformMatch.test(item) ? item.includes(Platform.OS) : true,
    );
    const finalSheet = CssResolver(purged, {
      deviceHeight: context.deviceHeight,
      deviceWidth: context.deviceHeight,
      rem: context.units.rem,
      platform: Platform.OS,
      colorScheme: context.colorScheme,
      debug: false,
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

interface ModuleConfig {
  rem: number;
  theme: Config['theme'];
}

export function install({ rem, theme }: ModuleConfig = { rem: 16, theme: {} }) {
  globalStore.setState((prev) => ({
    ...prev,
    context: {
      ...prev.context,
      units: {
        ...prev.context.units,
        em: rem,
        rem: rem,
      },
    },
  }));
  const interpreter = initialize({
    colors: {
      ...theme?.colors,
    },
    fontFamily: {
      ...theme?.fontFamily,
    },
  });
  SheetManager.twind = interpreter;
}
