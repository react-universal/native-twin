import { toCondition } from './theme.utils';
import { Context, ExpArrayMatchResult, Rule, RuleConfig } from '../types/config.types';
import { BaseTheme } from '../types/theme.types';

export class RuleHandler<Theme extends BaseTheme = BaseTheme> {
  ruleConfig: RuleConfig<Theme>;
  private basePattern: string | RegExp;
  support: Exclude<RuleConfig<Theme>['support'], undefined> = ['native', 'web'];
  constructor(themeRule: Rule<Theme>) {
    this.ruleConfig = themeRule[1];
    this.basePattern = themeRule[0];
    if (this.ruleConfig.support) {
      this.support = this.ruleConfig.support;
    }
  }

  resolve(token: string, ctx: Context<Theme>) {
    const condition = toCondition(this.basePattern);
    let match = condition.exec(token) as ExpArrayMatchResult;
    if (!match) return null;
    match.$$ = token.slice(match[0].length);
    if (this.ruleConfig.resolver && typeof this.ruleConfig.resolver == 'function') {
      return this.ruleConfig.resolver(match, ctx);
    }

    // Rule is [pattern, RuleConfig]
    if (typeof this.basePattern == 'string') {
      if (token.startsWith('-') && !this.ruleConfig.canBeNegative) return null;

      const section = this.ruleConfig.themeAlias;
      let value = ctx.theme(section, token.slice(this.basePattern.length));

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

    return null;
  }
}
