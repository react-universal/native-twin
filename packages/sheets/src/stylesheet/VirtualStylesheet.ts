import { hash } from '@universal-labs/twind-adapter';
import type { Config } from 'tailwindcss';
import { cssParser } from '../css/css.parser';
import type { ComponentStylesheet } from '../types';
import StyleSheetCache from './StyleSheetCache';

let currentConfig: Config = { content: ['__'], theme: { colors: {}, fontFamily: {} } };
const store = new StyleSheetCache<string, ComponentStylesheet>(100);
let transform = cssParser();

export class VirtualStyleSheet {
  injectUtilities(classNames?: string): ComponentStylesheet {
    const hashID = hash(classNames ?? 'unstyled');
    const cache = store.get(hashID);
    if (cache) {
      return cache;
    }
    if (!classNames) {
      const result = {
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
      store.set(hashID, result);
      return result;
    }
    const stylesFinal = transform(classNames);
    console.log('stylesFinal', stylesFinal);
    const result = {
      hash: hashID,
      baseStyles: stylesFinal.base,
      pointerStyles: stylesFinal.pointer,
      groupStyles: stylesFinal.group,
      even: stylesFinal.even,
      first: stylesFinal.first,
      last: stylesFinal.last,
      odd: stylesFinal.odd,
      isGroupParent: stylesFinal.isGroupParent,
      hasPointerEvents: Object.keys(stylesFinal.pointer).length > 0,
      hasGroupeEvents: Object.keys(stylesFinal.group).length > 0,
    };
    store.set(hashID, result);
    return result;
  }
}

export function setTailwindConfig(config: Config, baseRem = 16) {
  currentConfig = {
    ...currentConfig,
    ...config,
  };
  // globalParser.tw.destroy();
  transform = cssParser({
    content: ['..'],
    theme: {
      colors: {
        ...currentConfig.theme?.colors,
      },
      fontFamily: {
        ...currentConfig.theme?.fontFamily,
      },
    },
  });
  return {
    baseRem,
  };
}
