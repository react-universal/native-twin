import type {
  Context,
  ExpArrayMatchResult,
  Rule,
  RuleConfig,
  RuleResult,
} from '../types/config.types';
import type { BaseTheme, ThemeValue } from '../types/theme.types';
import type { ParsedRule } from '../types/parser.types';
import { toColorValue, toCondition } from './theme.utils';

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

  get isColorRule() {
    return /color|fill|stroke/i.test(
      String(this.ruleConfig.themeAlias) ?? this.ruleConfig.propertyAlias,
    );
  }

  private resolveColor(
    parsedRule: ParsedRule,
    themeValue: ThemeValue<Theme['colors']>,
  ): RuleResult {
    let key = this.ruleConfig.propertyAlias ?? String(this.ruleConfig.themeAlias);
    if (parsedRule.m) {
      let opacity = parsedRule.m.value;
      if (opacity.startsWith('[') && opacity.endsWith(']')) {
        opacity = opacity.slice(1, -1);
      }
      key = key.replace(/[A-Z]/g, (_) => '-' + _.toLowerCase());
      return {
        [key]: toColorValue(themeValue, {
          opacityValue: opacity,
        }),
      };
    }
    return {
      [key]: toColorValue(themeValue, {
        opacityValue: '1',
      }),
    };
  }

  resolve(parsedRule: ParsedRule, ctx: Context<Theme>): RuleResult {
    const condition = toCondition(this.basePattern);
    const token = parsedRule.n;
    let match = condition.exec(token) as ExpArrayMatchResult;
    if (!match) return null;
    match.$$ = token.slice(match[0].length);

    if (this.isColorRule && !this.ruleConfig.resolver) {
      const value = ctx.theme('colors', match.$$);
      if (value) return this.resolveColor(parsedRule, value);
    }

    if (token.includes('[') && token.slice(-1) == ']') {
      match.$$ = token.slice(token.indexOf('['));
    }
    // console.log('MATCH: ', match);

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
