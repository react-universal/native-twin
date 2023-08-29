import { toCondition } from '../theme/theme.utils';
import { Context, Rule, RuleConfig, RuleResolver } from '../types/config.types';
import { BaseTheme } from '../types/theme.types';

export class RuleHandler<Theme extends BaseTheme = BaseTheme> {
  ruleConfig: RuleConfig<Theme> | RuleResolver<Theme>;
  private basePattern: string | RegExp;
  constructor(themeRule: Rule<Theme>) {
    this.ruleConfig = themeRule[1];
    this.basePattern = themeRule[0];
  }

  resolve(token: string, ctx: Context<Theme>) {
    const condition = toCondition(this.basePattern);
    const match = condition.exec(token);
    if (!match) return null;
    if (typeof this.basePattern == 'string' && typeof this.ruleConfig == 'object') {
      if (token.startsWith('-') && !this.ruleConfig.canBeNegative) return null;

      const section = this.ruleConfig.themeAlias;
      const segments = token.slice(this.basePattern.length).split('-');
      let value = ctx.theme(section, segments);

      if (!value) {
        return null;
      }

      let key = String(this.ruleConfig.propertyAlias ?? this.ruleConfig.themeAlias);
      key = key.replace(/[A-Z]/g, (_) => '-' + _.toLowerCase());

      const result = {
        [key]: value!,
      };
      return result;
    }

    if (typeof this.ruleConfig == 'function') {
      return this.ruleConfig(match, ctx);
    }

    if (this.ruleConfig.resolver && typeof this.ruleConfig.resolver == 'function') {
      return this.ruleConfig.resolver(match, ctx);
    }
    return null;
  }
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
