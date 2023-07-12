import { hash } from '@universal-labs/twind-adapter';
import type { Config } from 'tailwindcss';
import { EMPTY_SHEET } from '../../constants/empties';
import type { ComponentStylesheet } from '../../types/styled.types';
import { createTwindInterpreter } from '../css/twind';
import StyleSheetCache from './StyleSheetCache';

let currentConfig: Config = { content: ['__'], theme: { colors: {}, fontFamily: {} } };
const store = new StyleSheetCache<string, ComponentStylesheet>(100);
const twind = createTwindInterpreter();

export class VirtualStyleSheet {
  create(input: string) {
    const result = twind.classNamesToCss(input);
    return result.ast;
  }
  injectUtilities(classNames?: string): ComponentStylesheet {
    const hashID = hash(classNames ?? 'unstyled');
    const cache = store.has(hashID);
    if (cache) {
      return store.get(hashID)!;
    }
    if (!classNames) {
      if (!store.has(hashID)) store.set(hashID, EMPTY_SHEET);
      return EMPTY_SHEET;
    }

    const newSheet = twind.classNamesToCss(classNames);
    const styles = {
      hash: hashID,
      hasPointerEvents: Object.keys(newSheet.ast.pointer).length > 0,
      hasGroupEvents: Object.keys(newSheet.ast.group).length > 0,
      styles: newSheet.ast,
      isGroupParent: newSheet.isGroupParent,
    };
    store.set(hashID, styles);
    return styles;
  }
}

export function setTailwindConfig(config: Config, baseRem = 16) {
  currentConfig = {
    ...currentConfig,
    ...config,
  };
  twind.setThemeConfig(config, baseRem);
  return {
    baseRem,
  };
}
