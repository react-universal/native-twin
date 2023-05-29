import { hash } from '@universal-labs/twind-adapter';
import type { Config } from 'tailwindcss';
import { lexer } from '../css/Lexer';
import type { ComponentStylesheet } from '../types';
import StyleSheetCache from './StyleSheetCache';

let currentConfig: Config = { content: ['__'], theme: { colors: {}, fontFamily: {} } };
const store = new StyleSheetCache<string, ComponentStylesheet>(100);

export class VirtualStyleSheet {
  injectUtilities(classNames?: string): ComponentStylesheet {
    const hashID = hash(classNames ?? 'unstyled');
    const finalStyles: ComponentStylesheet = {
      baseStyles: {},
      pointerStyles: {},
      groupStyles: {},
      even: {},
      first: {},
      last: {},
      odd: {},
      isGroupParent: false,
      hasPointerEvents: false,
      hasGroupeEvents: false,
      hash: hashID,
    };
    const cache = store.get(hashID);
    if (cache) {
      return cache;
    }
    if (!classNames) {
      store.set(hashID, finalStyles);
      return finalStyles;
    }
    const injected = lexer.injectClassNames(classNames);
    if (injected.generated.includes('group')) {
      finalStyles.isGroupParent = true;
    }
    finalStyles.baseStyles = injected.baseCss;
    finalStyles.pointerStyles = injected.pointerCss;
    finalStyles.groupStyles = injected.groupCss;
    finalStyles.even = injected.evenCss;
    finalStyles.odd = injected.oddCss;
    finalStyles.first = injected.firstCss;
    finalStyles.last = injected.lastCss;
    finalStyles.hasPointerEvents = injected.hasPointerEvents;
    finalStyles.hasGroupeEvents = injected.hasGroupEvents;
    finalStyles.isGroupParent = injected.isGroupParent;
    store.set(hashID, finalStyles);
    return finalStyles;
  }
}

export function setTailwindConfig(config: Config, baseRem = 16) {
  currentConfig = {
    ...currentConfig,
    ...config,
  };
  lexer.setThemeConfig(config, baseRem);
  return {
    baseRem,
  };
}
