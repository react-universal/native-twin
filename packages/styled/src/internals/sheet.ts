import { Platform } from 'react-native';
import { AnyStyle, CssResolver, FinalSheet } from '@universal-labs/css';
import { initialize } from '@universal-labs/twind-adapter';
import type { Config } from 'tailwindcss';
import { SheetInteractionState, SheetInterpreterFn, SheetManagerFn } from '../types/css.types';
import { ComponentStylesheet } from '../types/styled.types';
import StyleSheetCache from './StyleSheetCache';

const platformMatch = /web|ios|android|native+/;

export const SheetManager: SheetManagerFn = (context) => {
  // const virtualSheet = new Map<string, any>();
  // let currentConfig: Config = { content: ['_'] };
  new StyleSheetCache<string, ComponentStylesheet>(100);

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
    const restore = SheetManager.twind.tw.snapshot();
    const generateClassNames = SheetManager.twind.tx(classNames).split(' ');
    const target = [...SheetManager.twind.tw.target];
    restore();
    const purged = target.filter((item) =>
      platformMatch.test(item) ? item.includes(Platform.OS) : true,
    );
    const finalSheet = CssResolver(purged, {
      deviceHeight: context.deviceHeight,
      deviceWidth: context.deviceHeight,
      rem: context.units.rem,
      platform: Platform.OS,
    });
    return {
      finalSheet,
      getStyles: (input) => getStyles(finalSheet, input),
      getChildStyles: (data) => getChildStyles(finalSheet, data),
      metadata: {
        isGroupParent: generateClassNames.includes('group'),
        hasPointerEvents: Object.keys(finalSheet.pointer).length > 0,
        hasGroupEvents: Object.keys(finalSheet.group).length > 0,
      },
    };
  };

  return sheetFn;
};

SheetManager.twind = initialize();
SheetManager.setThemeConfig = (config: Config) => {
  SheetManager.twind.tw.destroy();
  SheetManager.twind = initialize({
    colors: {
      ...config?.theme?.colors,
    },
    fontFamily: {
      ...config?.theme?.fontFamily,
    },
  });
};
