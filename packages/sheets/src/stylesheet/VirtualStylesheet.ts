import { hash } from '@twind/core';
import {
  normalizeClassNameString,
  transformClassNames,
  virtualStylesheet as createVirtualStyleSheet,
} from '@universal-labs/twind-native';
import cssParser, { Rule, Declaration } from 'css';
import type { AnyStyle, ComponentStylesheet } from '../types';

export class VirtualStyleSheet {
  private sheet = createVirtualStyleSheet();
  private processedClasses = new Set();
  private storedSheets = new Map<string, ComponentStylesheet>();
  private storedUtilities = new Map<string, AnyStyle>();

  injectUtilities(classNames?: string) {
    const transformedClasses = transformClassNames(classNames ?? '');
    const classNamesHash = hash(transformedClasses.generated);
    const splittedClasses = Object.freeze(transformedClasses.generated);
    this.processedClasses = new Set(splittedClasses);
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

  extractDeclarationsFromRule = (rule: Rule[]) => {
    const declarations = rule
      .reduce((current, next) => {
        if (next.declarations) {
          const getSelectors = next.selectors?.reduce((c, n) => {
            return `${c}${normalizeClassNameString(n)}`;
          }, ``);
          if (getSelectors) {
            // console.log('getSelectors', next.declarations.length);
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

// const finalStyles = extracted.reduce(
//   (current, next) => {
//     if (
//       (next[0].includes('ios') ||
//         next[0].includes('android') ||
//         next[0].includes('web')) &&
//       !next[0].includes('hover') &&
//       !next[0].includes('focus') &&
//       !next[0].includes('active')
//     ) {
//       if (next[0].includes(Platform.OS)) {
//         current.base.push(transform(next[1]));
//         return current;
//       }
//     }
//     if (next[0].includes(':') && !next[0].includes('group')) {
//       metadata.hasPointerEvents = true;
//       current.pointerStyles.push(transform(next[1]));
//     }
//     if (next[0].includes(':') && next[0].includes('group')) {
//       metadata.hasGroupEvents = true;
//       current.group.push(transform(next[1]));
//     }
//     if (next[0].includes(':') && next[0].includes('odd')) {
//       current.odd.push(transform(next[1]));
//     }
//     if (next[0].includes(':') && next[0].includes('even')) {
//       current.even.push(transform(next[1]));
//     }
//     if (next[0].includes(':') && next[0].includes('first')) {
//       current.first.push(transform(next[1]));
//     }
//     if (next[0].includes(':') && next[0].includes('last')) {
//       current.last.push(transform(next[1]));
//     }
//     if (!next[0].includes(':')) {
//       current.base.push(transform(next[1]));
//     }
//     return current;
//   },
//   {
//     base: [] as AnyStyle[],
//     pointerStyles: [] as AnyStyle[],
//     first: [] as AnyStyle[],
//     last: [] as AnyStyle[],
//     even: [] as AnyStyle[],
//     odd: [] as AnyStyle[],
//     group: [] as AnyStyle[],
//   },
// );
// this.storedSheets.set(
//   id,
//   StyleSheet.create({
//     base: StyleSheet.flatten(baseStyles),
//     pointerStyles: StyleSheet.flatten(finalStyles.pointerStyles),
//     first: StyleSheet.flatten(finalStyles.first),
//     last: StyleSheet.flatten(finalStyles.last),
//     even: StyleSheet.flatten(finalStyles.even),
//     odd: StyleSheet.flatten(finalStyles.odd),
//     group: StyleSheet.flatten(finalStyles.group),
//   }),
// );
