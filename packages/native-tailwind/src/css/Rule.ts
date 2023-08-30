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

    // Rule is [pattern, RuleConfig]
    if (typeof this.basePattern == 'string' && typeof this.ruleConfig == 'object') {
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

    // Rule is [pattern, RuleResolver]
    if (typeof this.ruleConfig == 'function') {
      return this.ruleConfig(match, ctx);
    }

    // Rule is [pattern, RuleConfig with: {..., resolver: RuleResolver}]
    if (this.ruleConfig.resolver && typeof this.ruleConfig.resolver == 'function') {
      return this.ruleConfig.resolver(match, ctx);
    }
    return null;
  }
}
