import { initialize, stringify, parse, normalize } from '@universal-labs/twind-adapter';
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
const declarationsRegex = /([\w-]*)\s*:\s*([^;|^}]+)/;

export class VirtualStyleSheet {
  injectUtilities(classNames?: string) {
    const classes = parse(classNames ?? '');
    const baseUtilities: AnyStyle[] = [];
    const pointerStyles: AnyStyle[] = [];
    const groupStyles: AnyStyle[] = [];
    let isGroupParent = false;
    let hasPointerEvents = false;
    let hasGroupeEvents = false;
    for (const currentClassName of classes) {
      // console.log('STYLE_RULE', currentClassName);
      // if current class does not have any pseudo selectors is a base style
      const cache = store.get(currentClassName.n);
      if (currentClassName.v.length === 0) {
        if (currentClassName.n === 'group') {
          isGroupParent = true;
        }
        if (cache) {
          baseUtilities.push(...cache);
          continue;
        }
        globalParser.tx(currentClassName.n);
        const ast = cssParser.parse(this.transformClassNames(currentClassName.n).css);
        const normal = normalize(this.transformClassNames(currentClassName.n).css);
        const result = declarationsRegex.exec(normal);
        console.log('RESULT', result, normal);
        const extracted = this.extractDeclarationsFromRule(
          ast.stylesheet?.rules.filter((r) => {
            if (r.type !== 'rule' || !('selectors' in r)) return false;
            return true;
          }) ?? [],
        ).map((d) => {
          return transform(d[1]);
        });
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
        globalParser.tx(currentClassName.n);
        const ast = cssParser.parse(this.transformClassNames(currentClassName.n).css);
        const extracted = this.extractDeclarationsFromRule(
          ast.stylesheet?.rules.filter((r) => {
            if (r.type !== 'rule' || !('selectors' in r)) return false;
            return true;
          }) ?? [],
        ).map((d) => {
          return transform(d[1]);
        });
        pointerStyles.push(...extracted);
        store.update(currentClassName.n, extracted);
        continue;
      }
      // console.log('CURRENT_CLASS', currentClassName.v);
      if (
        currentClassName.v.includes('group-hover') ||
        currentClassName.v.includes('group-focus') ||
        currentClassName.v.includes('group-active')
      ) {
        // hasPointerEvents = true;
        hasGroupeEvents = true;
        if (cache) {
          groupStyles.push(...cache);
          continue;
        }
        globalParser.tx(currentClassName.n);
        const ast = cssParser.parse(this.transformClassNames(currentClassName.n).css);
        const extracted = this.extractDeclarationsFromRule(
          ast.stylesheet?.rules.filter((r) => {
            if (r.type !== 'rule' || !('selectors' in r)) return false;
            return true;
          }) ?? [],
        ).map((d) => {
          return transform(d[1]);
        });
        groupStyles.push(...extracted);
        store.update(currentClassName.n, extracted);
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
            current.push([getSelectors, next.declarations]);
          }
        }
        return current;
      }, [] as [string, Declaration[]][])
      .map((d) => {
        const declarations = d[1].reduce((current, next) => {
          current.push([next.property!, next.value!]);
          return current;
        }, [] as [string, string][]);
        const utility = d[0];
        return [utility, declarations] as [string, [string, string][]];
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

  getClasses(classNames: string) {
    return globalParser.cx(classNames).split(' ');
  }

  createStyleSheet() {}
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
