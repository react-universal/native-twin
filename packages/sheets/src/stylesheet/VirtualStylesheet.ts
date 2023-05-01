import { hash } from '@twind/core';
import { normalizeClassNameString, transformClassNames } from '@universal-labs/twind-native';
import cssParser, { Rule, Declaration } from 'css';

export class VirtualStyleSheet {
  injectUtilities(classNames?: string) {
    const transformedClasses = transformClassNames(classNames ?? '');
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

  createStyleSheet() {}
}
