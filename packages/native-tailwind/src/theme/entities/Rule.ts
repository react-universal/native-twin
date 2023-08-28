// import * as P from '@universal-labs/css/parser';
import { toArray } from '../../common/fn.helpers';
import { Context, Rule, RuleConfig } from '../../types/config.types';
import { BaseTheme } from '../../types/theme.types';

export class RuleHandler<Theme extends BaseTheme = BaseTheme> {
  ruleConfig: RuleConfig<Theme>;
  private basePatterns: string[];
  private themeValues: Record<string, any> = {};
  cache: Map<string, any> = new Map();
  constructor(themeRule: Rule<Theme>) {
    this.ruleConfig = themeRule[1];
    this.basePatterns = toArray(themeRule[0]);
  }

  get patterns() {
    return Object.keys(this.themeValues);
  }

  testToken(token: string, ctx: Context<Theme>) {
    if (this.cache.has(token)) {
      return this.cache.get(token)!;
    }
    if (token.startsWith('-') && !this.ruleConfig.canBeNegative) return null;
    const feature = this.basePatterns.find((x) => {
      if (this.ruleConfig.canBeNegative && token.startsWith('-')) {
        return token.slice(1).startsWith(x);
      }
      return token.startsWith(x);
    });
    if (!feature) return null;

    const followingMatch = token.slice(feature.length);
    let value = ctx.theme(this.ruleConfig.themeAlias, followingMatch.split('-'));
    if (!value) {
      return null;
    }
    return {
      [this.ruleConfig.propertyAlias ?? this.ruleConfig.themeAlias]: value ?? followingMatch,
    };
  }

  // extractThemeValues(ctx: Context<Theme>) {
  //   for (const pattern of toArray(this.basePatterns)) {
  //     for (const section of toArray(this.ruleConfig.propertyAlias)) {
  //       if (!pattern.endsWith('-')) {
  //         let rawValue = ctx.theme(section, [pattern]);
  //         if (typeof rawValue == 'function') rawValue = rawValue(ctx);
  //         this.themeValues[pattern] = {
  //           [section]: rawValue,
  //         };
  //         continue;
  //       }
  //       let rawValue = ctx.theme(section);
  //       if (typeof rawValue == 'function') rawValue = rawValue(ctx);
  //       const themeValue = flattenObject(rawValue);
  //       for (const key in themeValue) {
  //         if (typeof themeValue[key] == 'string') {
  //           this.themeValues[`${pattern}${key}`] = {
  //             [section]: themeValue[key],
  //           };
  //         }
  //       }
  //     }
  //   }
  //   return this.themeValues;
  // }
}

// function flattenObject(theme: any, path: string[] = []) {
//   const flatten: Record<string, any> = {};

//   for (const key in theme) {
//     const value = theme[key];

//     let keyPath = [...path, key];
//     if (value) {
//       flatten[keyPath.join('-')] = value;
//     }

//     if (key == 'DEFAULT') {
//       keyPath = path;
//       if (value) {
//         flatten[path.join('-')] = value;
//       }
//     }

//     if (typeof value == 'object') {
//       Object.assign(flatten, flattenObject(value, keyPath));
//     }
//   }

//   return flatten;
// }
