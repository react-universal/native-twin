import { hash, initialize, stringify } from '@universal-labs/twind-adapter';
import cssParser, { Rule, Declaration } from 'css';
import type { Config } from 'tailwindcss';
import { normalizeClassNameString } from '../utils/helpers';

let currentConfig: Config = { content: ['__'], theme: { colors: {}, fontFamily: {} } };
let globalParser = initialize({
  colors: {},
  fontFamily: {},
});
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

export class VirtualStyleSheet {
  injectUtilities(classNames?: string) {
    const transformedClasses = this.transformClassNames(classNames ?? '');
    const classNamesHash = hash(transformedClasses.generated);
    const cssA = cssParser.parse(transformedClasses.css);
    const onlyRules = cssA.stylesheet?.rules ?? [];
    const extracted = this.extractDeclarationsFromRule(
      onlyRules.filter((r) => {
        if (r.type !== 'rule' || !('selectors' in r)) return false;
        return true;
      }),
    );

    return {
      extracted,
      generatedClasses: transformedClasses.generated,
      classNamesHash,
    };
  }

  extractDeclarationsFromRule = (rules: Rule[]) => {
    const declarations = rules
      .reduce((current, next) => {
        if (next.declarations) {
          const getSelectors = next.selectors?.reduce((c, n) => {
            return `${c}${normalizeClassNameString(n)}`;
          }, ``);
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

  createStyleSheet() {}
}
