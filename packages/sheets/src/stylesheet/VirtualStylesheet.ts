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
      hasGroupEvents: false,
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
    const injected = lexer.classNamesToCss(classNames);
    finalStyles.isGroupParent = injected.isGroupParent;
    finalStyles.baseStyles = injected.ast.base;
    finalStyles.pointerStyles = injected.ast.pointer;
    finalStyles.groupStyles = injected.ast.group;
    finalStyles.even = injected.ast.even;
    finalStyles.odd = injected.ast.odd;
    finalStyles.first = injected.ast.first;
    finalStyles.last = injected.ast.last;
    finalStyles.hasPointerEvents = Object.keys(injected.ast.pointer).length > 0;
    finalStyles.hasGroupEvents = Object.keys(injected.ast.group).length > 0;
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
