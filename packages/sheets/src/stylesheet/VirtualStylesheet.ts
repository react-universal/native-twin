/* eslint-disable no-console */
import { initialize, hash } from '@universal-labs/twind-adapter';
import transform from 'css-to-react-native';
import type { Config } from 'tailwindcss';
import { CssTokenizer } from '../runtime/parser/CssParser';
import type { AnyStyle, ComponentStylesheet } from '../types';
import { normalizeClassNameString } from '../utils/helpers';
import {
  extractDeclarationsFromCSS,
  isEvenSelector,
  isGroupSelector,
  isOddSelector,
  isPlatformSelector,
  isPointerSelector,
  isFirstSelector,
  isLastSelector,
} from '../utils/recursiveParser';
import StyleSheetCache from './StyleSheetCache';

const Platform = {
  OS: 'ios',
};

let currentConfig: Config = { content: ['__'], theme: { colors: {}, fontFamily: {} } };
let globalParser = initialize({
  colors: {},
  fontFamily: {},
});
const store = new StyleSheetCache<string, ComponentStylesheet>(100);
const stylesStore = new StyleSheetCache<string, AnyStyle>(100);
// const declarationsRegex = /([\w-]*)\s*:\s*([^;|^}]+)/;

export class VirtualStyleSheet {
  injectUtilities(classNames?: string): ComponentStylesheet {
    const hashID = hash(classNames ?? 'unstyled');
    // reduxDevToolsConnection.send('ACTION', {
    //   store: Object.fromEntries(store.print()),
    //   styles: Object.fromEntries(stylesStore.print()),
    // });
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
    const transformed = this.transformClassNames(classNames);
    const styles = {
      base: [] as AnyStyle[],
      pointer: [] as AnyStyle[],
      group: [] as AnyStyle[],
      even: [] as AnyStyle[],
      odd: [] as AnyStyle[],
      first: [] as AnyStyle[],
      last: [] as AnyStyle[],
    };
    for (const [rule, css] of transformed.target) {
      if (isPlatformSelector(rule)) {
        if (!rule.includes(Platform.OS)) {
          continue;
        }
      }
      console.group('CSS');
      const tokenized = new CssTokenizer(css);
      if (tokenized.ast.isError) {
        console.debug(tokenized.ast);
      }
      console.groupEnd();
      let isGroup = isGroupSelector(rule);
      let isPointer = isPointerSelector(rule) && !isGroup;
      let isEven = isEvenSelector(rule);
      let isOdd = isOddSelector(rule);
      let isFirst = isFirstSelector(rule);
      let isLast = isLastSelector(rule);

      const cache = stylesStore.get(rule);
      if (cache) {
        if (isPointer) {
          styles.pointer.push(cache);
        } else if (isGroup) {
          styles.group.push(cache);
        } else if (isEven) {
          styles.even.push(cache);
        } else if (isOdd) {
          styles.odd.push(cache);
        } else if (isFirst) {
          styles.first.push(cache);
        } else if (isLast) {
          styles.last.push(cache);
        } else {
          styles.base.push(cache);
        }
        continue;
      }
      const extracted = extractDeclarationsFromCSS(css);
      if (isPointer) {
        const style = transform(extracted, ['transform']) as AnyStyle;
        styles.pointer.push(style as AnyStyle);
        stylesStore.set(rule, style);
      } else if (isGroup) {
        const style = transform(extracted, ['transform']) as AnyStyle;
        styles.group.push(style as AnyStyle);
        stylesStore.set(rule, style);
      } else if (isEven) {
        const style = transform(extracted, ['transform']) as AnyStyle;
        styles.even.push(style as AnyStyle);
        stylesStore.set(rule, style);
      } else if (isOdd) {
        const style = transform(extracted, ['transform']) as AnyStyle;
        styles.odd.push(style as AnyStyle);
        stylesStore.set(rule, style);
      } else if (isFirst) {
        const style = transform(extracted, ['transform']) as AnyStyle;
        styles.first.push(style as AnyStyle);
        stylesStore.set(rule, style);
      } else if (isLast) {
        const style = transform(extracted, ['transform']) as AnyStyle;
        styles.last.push(style as AnyStyle);
        stylesStore.set(rule, style);
      } else {
        const style = transform(extracted, ['transform']) as AnyStyle;
        styles.base.push(style as AnyStyle);
        stylesStore.set(rule, style);
      }
    }
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
    // const result = {
    //   hash: hashID,
    //   baseStyles: StyleSheet.flatten(styles.base),
    //   pointerStyles: StyleSheet.flatten(styles.pointer),
    //   groupStyles: StyleSheet.flatten(styles.group),
    //   even: StyleSheet.flatten(styles.even),
    //   first: StyleSheet.flatten(styles.first),
    //   last: StyleSheet.flatten(styles.last),
    //   odd: StyleSheet.flatten(styles.odd),
    //   isGroupParent: transformed.generated.includes('group'),
    //   hasPointerEvents: styles.pointer.length > 0,
    //   hasGroupeEvents: styles.group.length > 0,
    // };
    // store.update(hashID, result);
    store.set(hashID, result);
    return result;
  }

  transformClassNames(...classes: string[]) {
    const generated = globalParser.tx(...classes).split(' ');
    const target = globalParser.tw.target.reduce((acc, curr) => {
      const normalized = normalizeClassNameString(curr);
      const found = generated.find((x) => normalized.includes(x));
      if (found) {
        acc.push([found, curr]);
      }
      return acc;
    }, [] as [UtilityString: string, CssTarget: string][]);
    return {
      target,
      generated,
    };
  }

  getClasses(classNames: string) {
    return globalParser.cx(classNames).split(' ');
  }
}

export function setTailwindConfig(config: Config, baseRem = 16) {
  currentConfig = {
    ...currentConfig,
    ...config,
  };
  globalParser.tw.destroy();
  globalParser = initialize({
    colors: {
      ...currentConfig.theme?.colors,
    },
    fontFamily: {
      ...currentConfig.theme?.fontFamily,
    },
  });
  return {
    baseRem,
  };
}
