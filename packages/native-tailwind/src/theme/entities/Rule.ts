import { toArray } from '../../common/fn.helpers';
import { Context, Rule } from '../../config.types';
import { BaseTheme } from '../../theme.types';

export class RuleHandler<Theme extends BaseTheme = BaseTheme> {
  ruleConfig: Rule<Theme>;
  themeValues: Record<string, string> = {};
  constructor(themeRule: Rule<Theme>) {
    this.ruleConfig = themeRule;
  }

  extractThemeValues(ctx: Context<Theme>) {
    const themeObj: Record<string, any> = {};
    for (const pattern of toArray(this.ruleConfig[0])) {
      if (!pattern.endsWith('-')) {
        for (const section of toArray(this.ruleConfig[1].propertyAlias)) {
          let rawValue = ctx.theme(section, [pattern]);
          if (typeof rawValue == 'function') rawValue = rawValue(ctx);
          if (typeof rawValue == 'string') {
            themeObj[pattern] = {
              [section]: rawValue,
            };
            continue;
          }
        }
        continue;
      }
      for (const section of toArray(this.ruleConfig[1].propertyAlias)) {
        let rawValue = ctx.theme(section);
        if (typeof rawValue == 'function') rawValue = rawValue(ctx);
        const themeValue = flattenObject(rawValue);
        for (const key in themeValue) {
          if (typeof themeValue[key] == 'string') {
            themeObj[`${pattern}${key}`] = {
              [section]: themeValue[key],
            };
          }
        }
      }
    }
    this.themeValues = themeObj;
    return this.themeValues;
  }
}

function flattenObject(theme: any, path: string[] = []) {
  const flatten: Record<string, any> = {};

  for (const key in theme) {
    const value = theme[key];

    let keyPath = [...path, key];
    if (value) {
      // a-
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
