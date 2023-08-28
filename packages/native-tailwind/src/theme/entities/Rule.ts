import * as P from '@universal-labs/css/parser';
import { toArray } from '../../common/fn.helpers';
import { Context, Rule } from '../../config.types';
import { BaseTheme } from '../../theme.types';

export class RuleHandler<Theme extends BaseTheme = BaseTheme> {
  ruleConfig: Rule<Theme>;
  themeValues: Record<string, any> = {};
  isColor = false;
  constructor(themeRule: Rule<Theme>) {
    this.ruleConfig = themeRule;
  }

  parser() {
    const patterns = Object.keys(this.themeValues);
    return P.choice(patterns.map((x) => P.literal(x))).map((x: string) => ({
      rule: this.ruleConfig,
      value: x,
    }));
  }

  extractThemeValues(ctx: Context<Theme>) {
    for (const pattern of toArray(this.ruleConfig[0])) {
      for (const section of toArray(this.ruleConfig[1].propertyAlias)) {
        if (!pattern.endsWith('-')) {
          let rawValue = ctx.theme(section, [pattern]);
          if (typeof rawValue == 'function') rawValue = rawValue(ctx);
          this.themeValues[pattern] = {
            [section]: rawValue,
          };
          continue;
        }
        let rawValue = ctx.theme(section);
        if (typeof rawValue == 'function') rawValue = rawValue(ctx);
        const themeValue = flattenObject(rawValue);
        for (const key in themeValue) {
          if (typeof themeValue[key] == 'string') {
            this.themeValues[`${pattern}${key}`] = {
              [section]: themeValue[key],
            };
          }
        }
      }
    }
    return this.themeValues;
  }
}

function flattenObject(theme: any, path: string[] = []) {
  const flatten: Record<string, any> = {};

  for (const key in theme) {
    const value = theme[key];

    let keyPath = [...path, key];
    if (value) {
      flatten[keyPath.join('-')] = value;
    }

    if (key == 'DEFAULT') {
      keyPath = path;
      if (value) {
        flatten[path.join('-')] = value;
      }
    }

    if (typeof value == 'object') {
      Object.assign(flatten, flattenObject(value, keyPath));
    }
  }

  return flatten;
}
