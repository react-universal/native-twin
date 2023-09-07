import type {
  Context,
  ExpArrayMatchResult,
  Rule,
  RuleExpansionProperties,
  RuleResolver,
  RuleResult,
} from '../types/config.types';
import type { ParsedRule } from '../types/parser.types';
import type { BaseTheme } from '../types/theme.types';
import { colorResolver } from './matchers/color.resolver';
import { toCondition } from './theme.utils';

export function createRuleResolver<Theme extends BaseTheme = BaseTheme>(
  rule: Rule<Theme>,
  ctx: Context<Theme>,
) {
  const basePattern = rule[0];
  const ruleRegex = toCondition(rule[0]);
  const ruleConfig = rule[1];
  const isColorRule =
    typeof ruleConfig == 'object' &&
    /color|fill|stroke/i.test(String(ruleConfig.propertyAlias ?? ruleConfig.themeAlias));

  return (parsedRule: ParsedRule): RuleResult => {
    const token = parsedRule.n;
    const match = getMatch(token, ruleRegex);
    if (!match) return null;

    // Rule ends with arbitrary value
    if (token.includes('[') && token.slice(-1) == ']') {
      match.$$ = token.slice(token.indexOf('['));
    }

    // Rule already has a resolver
    if (typeof ruleConfig == 'function') {
      const value = ruleConfig(match, ctx, parsedRule);
      if (value) return value;
      return null;
    }

    let resolver: RuleResolver | null = null;
    if (ruleConfig.resolver && typeof ruleConfig.resolver == 'function') {
      resolver = ruleConfig.resolver;
    }
    if (resolver) {
      const data = resolver(match, ctx, parsedRule);
      if (typeof data == 'object') {
        return data;
      }
    }

    if (ruleConfig.expansion) {
      const { kind } = ruleConfig.expansion;
      if (kind == 'edges') return resolveEdgeRule(match, parsedRule, ruleConfig.expansion);
    }

    if (isColorRule && !resolver) {
      const data = colorResolver(parsedRule, match, ctx);
      if (typeof data == 'string') {
        return {
          [ruleConfig.propertyAlias ?? ruleConfig.themeAlias]: data,
        };
      }
    }

    if (typeof basePattern == 'string') {
      if (token.startsWith('-') && !ruleConfig.canBeNegative) return null;

      let value: any = null;
      value = ctx.theme(ruleConfig.themeAlias, token.slice(basePattern.length));
      if (!value) return null;

      if (typeof value == 'string') {
        let key = String(ruleConfig.propertyAlias ?? ruleConfig.themeAlias);
        key = key.replace(/[A-Z]/g, (_) => '-' + _.toLowerCase());
        if (ruleConfig.canBeNegative && parsedRule.n.startsWith('-')) {
          value = `-${value}`;
        }
        return {
          [key]: value,
        };
      }
    } else {
      let value = ctx.theme(ruleConfig.themeAlias, match[1]);
      if (value) {
        const isNegative = ruleConfig.canBeNegative && parsedRule.n.startsWith('-');
        return {
          [ruleConfig.propertyAlias ?? ruleConfig.themeAlias]: `${
            isNegative ? '-' : ''
          }${value}`,
        };
      }
    }
    return null;
  };

  function resolveEdgeRule(
    match: ExpArrayMatchResult,
    parsedRule: ParsedRule,
    config: RuleExpansionProperties,
  ) {
    if (typeof ruleConfig == 'function') {
      return ruleConfig(match, ctx, parsedRule);
    }
    const finalRuleBlock: Record<string, string> = {};
    const { prefix, suffix } = config;
    const properties = getEdgeProperties(prefix, suffix, match).map((x) =>
      x.replace(/[A-Z]/g, (_) => '-' + _.toLowerCase()),
    );
    // console.log('MM', match);
    let value = ctx.theme(ruleConfig.themeAlias, match[2]);
    if (isColorRule && typeof value == 'string') {
      value = colorResolver(parsedRule, match, ctx) as any;
    }
    if (value && typeof value == 'string') {
      const isNegative = ruleConfig.canBeNegative && parsedRule.n.startsWith('-');
      for (const key of properties) {
        Object.assign(finalRuleBlock, {
          [key]: `${isNegative ? '-' : ''}${value}`,
        });
      }
      return finalRuleBlock;
    }
    return null;
  }
}

function getMatch(token: string, regex: RegExp): ExpArrayMatchResult | null {
  let match = regex.exec(token) as ExpArrayMatchResult;
  if (!match) return null;
  match.$$ = token.slice(match[0].length);
  return match;
}

function position(shorthand: string, separator = '-'): string {
  const longhand: string[] = [];

  for (const short of shorthand) {
    longhand.push({ t: 'top', r: 'right', b: 'bottom', l: 'left' }[short] as string);
  }

  return longhand.join(separator);
}

function getEdgeProperties(
  propertyPrefix: string,
  propertySuffix = '',
  { 1: $1 }: ExpArrayMatchResult,
): string[] {
  const result: string[] = [];
  const edges =
    {
      x: 'lr',
      y: 'tb',
    }[$1 as 'x' | 'y'] || $1! + $1!;
  if (!edges[0] && !edges[1]) result.push(propertyPrefix + propertySuffix);
  if (edges[0]) result.push(propertyPrefix + '-' + position(edges[0]) + propertySuffix);
  if (edges[1]) result.push(propertyPrefix + '-' + position(edges[1]) + propertySuffix);
  return result;
}
