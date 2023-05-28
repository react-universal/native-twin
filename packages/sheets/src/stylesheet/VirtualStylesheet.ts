import { hash } from '@universal-labs/twind-adapter';
import type { Config } from 'tailwindcss';
import { selectorIsGroupPointerEvent, selectorIsPointerEvent } from '../css/helpers';
import { CssLexer } from '../css/tokenizer-generator';
import type { ComponentStylesheet } from '../types';
import StyleSheetCache from './StyleSheetCache';

let currentConfig: Config = { content: ['__'], theme: { colors: {}, fontFamily: {} } };
const store = new StyleSheetCache<string, ComponentStylesheet>(100);

export class VirtualStyleSheet {
  injectUtilities(classNames?: string): ComponentStylesheet {
    const hashID = hash(classNames ?? 'unstyled');
    const finalStyles = {
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
    const injected = CssLexer.injectClassNames(classNames);
    if (injected.generated.includes('group')) {
      finalStyles.isGroupParent = true;
    }
    for (const styles of CssLexer.parse()) {
      if (selectorIsGroupPointerEvent(styles.selector)) {
        finalStyles.hasPointerEvents = true;
        finalStyles.hasGroupeEvents = true;
        Object.assign(finalStyles.groupStyles, styles.declarations);
        continue;
      }
      if (selectorIsPointerEvent(styles.selector)) {
        finalStyles.hasPointerEvents = true;
        Object.assign(finalStyles.pointerStyles, styles.declarations);
        continue;
      }
      if (styles.selector.includes('first')) {
        Object.assign(finalStyles.first, styles.declarations);
        continue;
      }
      if (styles.selector.includes('last')) {
        Object.assign(finalStyles.last, styles.declarations);
        continue;
      }
      if (styles.selector.includes('even')) {
        Object.assign(finalStyles.even, styles.declarations);
        continue;
      }
      if (styles.selector.includes('odd')) {
        Object.assign(finalStyles.odd, styles.declarations);
        continue;
      }
      Object.assign(finalStyles.baseStyles, styles.declarations);
    }
    store.set(hashID, finalStyles);
    return finalStyles;
  }
}

export function setTailwindConfig(config: Config, baseRem = 16) {
  currentConfig = {
    ...currentConfig,
    ...config,
  };
  CssLexer.setThemeConfig(config);
  return {
    baseRem,
  };
}
