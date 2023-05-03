import { Platform } from 'react-native';
import { initialize, stringify, parse } from '@universal-labs/twind-adapter';
import cssParser, { Rule, Declaration } from 'css';
import transform from 'css-to-react-native';
import type { Config } from 'tailwindcss';
import type { AnyStyle } from '../types';
import { normalizeClassNameString } from '../utils/helpers';
import StyleSheetCache from './StyleSheetCache';

let currentConfig: Config = { content: ['__'], theme: { colors: {}, fontFamily: {} } };
let globalParser = initialize({
  colors: {},
  fontFamily: {},
});
const store = new StyleSheetCache<string, AnyStyle[]>(1000);
// const declarationsRegex = /([\w-]*)\s*:\s*([^;|^}]+)/;

export class VirtualStyleSheet {
  injectUtilities(classNames?: string) {
    const classes = parse(classNames ?? '');
    const baseUtilities: AnyStyle[] = [];
    const pointerStyles: AnyStyle[] = [];
    const groupStyles: AnyStyle[] = [];
    let isGroupParent = false;
    let hasPointerEvents = false;
    let hasGroupeEvents = false;
    if (!classNames) {
      return {
        baseUtilities,
        pointerStyles,
        groupStyles,
        isGroupParent,
        hasPointerEvents,
        hasGroupeEvents,
      };
    }
    for (const currentClassName of classes) {
      const cache = store.get(currentClassName.n);
      if (
        currentClassName.v.includes('web') ||
        currentClassName.v.includes('android') ||
        currentClassName.v.includes('ios')
      ) {
        if (!currentClassName.v.includes(Platform.OS)) continue;
      }
      if (currentClassName.v.length === 0) {
        if (currentClassName.n === 'group') {
          isGroupParent = true;
          continue;
        }
        if (cache) {
          baseUtilities.push(...cache);
          continue;
        }
        const ast = cssParser.parse(this.transformClassNames(currentClassName.n).css);
        const extracted = this.extractDeclarationsFromRule(
          ast.stylesheet?.rules.filter((r) => {
            if (r.type !== 'rule' || !('selectors' in r)) return false;
            return true;
          }) ?? [],
        );
        baseUtilities.push(...extracted);
        store.update(currentClassName.n, extracted);
        continue;
      }
      if (
        currentClassName.v.includes('hover') ||
        currentClassName.v.includes('focus') ||
        currentClassName.v.includes('active')
      ) {
        hasPointerEvents = true;
        if (cache) {
          pointerStyles.push(...cache);
          continue;
        }
        const ast = cssParser.parse(this.transformClassNames(currentClassName.n).css);
        const extracted = this.extractDeclarationsFromRule(
          ast.stylesheet?.rules.filter((r) => {
            if (r.type !== 'rule' || !('selectors' in r)) return false;
            return true;
          }) ?? [],
        );
        pointerStyles.push(...extracted);
        store.update(currentClassName.n, extracted);
        continue;
      }
      if (
        currentClassName.v.includes('group-hover') ||
        currentClassName.v.includes('group-focus') ||
        currentClassName.v.includes('group-active')
      ) {
        hasGroupeEvents = true;
        if (cache) {
          groupStyles.push(...cache);
          continue;
        }
        const ast = cssParser.parse(this.transformClassNames(currentClassName.n).css);
        const extracted = this.extractDeclarationsFromRule(
          ast.stylesheet?.rules.filter((r) => {
            if (r.type !== 'rule' || !('selectors' in r)) return false;
            return true;
          }) ?? [],
        );
        groupStyles.push(...extracted);
        store.update(currentClassName.n, extracted);
        continue;
      }
    }

    return {
      baseUtilities,
      isGroupParent,
      pointerStyles,
      hasPointerEvents,
      hasGroupeEvents,
      groupStyles,
    };
  }

  extractDeclarationsFromRule = (rules: Rule[]) => {
    const declarations = rules
      .reduce((current, next) => {
        if (next.declarations) {
          const getSelectors = next.selectors?.reduce((c, n) => {
            return `${c}${normalizeClassNameString(n)}`;
          }, ``);
          // console.log('DECLARATIONS', next.declarations.length, next.declarations);
          if (getSelectors) {
            current.push(...next.declarations);
          }
        }
        return current;
      }, [] as Declaration[])
      .map((d) => {
        return transform([[d.property!, d.value!]]);
      });
    return declarations;
  };

  transformClassNames(...classes: string[]) {
    const generated = globalParser.tx(...classes);
    const output = stringify(globalParser.tw.target);
    globalParser.tw.clear();
    return {
      target: globalParser.tw.target,
      generated,
      css: output,
    };
  }

  // getClasses(classNames: string) {
  //   return globalParser.cx(classNames).split(' ');
  // }
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
