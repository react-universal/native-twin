import type { ClassNameToken, ParsedRule } from '../types/parser.types';

/**
 * @description CSS Selector Escape
 */
export function escape(string: string) {
  return (
    string
      // Simplified escape testing only for chars that we know happen to be in tailwind directives
      .replace(/[!"'`*+.,;:\\/<=>?@#$%&^|~()[\]{}]/g, '\\$&')
      // If the character is the first character and is in the range [0-9] (2xl, ...)
      // https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
      .replace(/^\d/, '\\3$& ')
  );
}

export function parseClassNameTokens(...tokens: ClassNameToken[]): string {
  return tokens.reduce((prev, current, currentIndex) => {
    prev += current.value.n;
    if (currentIndex == tokens.length - 1) return prev;
    return prev;
  }, ``);
}

export function parsedRuleToString(rule: ParsedRule, mediaRules: string[]) {
  const fixedPoints = rule.v.reduce(
    (prev, current) => {
      if (mediaRules.includes(current)) {
        prev.prefix += `${current}:`;
      } else {
        prev.suffix += `:${current}`;
      }
      return prev;
    },
    {
      prefix: '.',
      suffix: '',
    },
  );
  return `${fixedPoints.prefix}${rule.i ? '!' : ''}${rule.n}${fixedPoints.suffix}`;
}
