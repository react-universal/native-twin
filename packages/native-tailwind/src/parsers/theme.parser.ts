import * as P from '@universal-labs/css/parser';
import { toColorValue } from '../theme/theme.utils';
import type { RuleMeta, ThemeContext } from '../types/config.types';
import type { CSSProperties } from '../types/css.types';
import type { ParsedRule, RulePatternToken } from '../types/parser.types';
import type { __Theme__ } from '../types/theme.types';

const defaultRuleMeta: RuleMeta = {
  canBeNegative: false,
  feature: 'default',
  baseProperty: undefined,
};

const maybeNegative = P.maybe(P.char('-'));

export function createRulePatternParser(pattern: string, meta = defaultRuleMeta) {
  const baseParser = P.literal(pattern);
  if (meta.canBeNegative) {
    return P.sequenceOf([maybeNegative, baseParser]).map(
      (x): RulePatternToken => ({
        base: x[1],
        negative: false,
      }),
    );
  }
  return baseParser.map(
    (x): RulePatternToken => ({
      base: x,
      negative: false,
    }),
  );
}

export function createThemeColorParser<Theme extends __Theme__ = __Theme__>(
  patternParser: P.Parser<RulePatternToken>,
  property: keyof CSSProperties,
  _meta: RuleMeta = {
    canBeNegative: false,
    feature: 'default',
    baseProperty: undefined,
  },
  context: ThemeContext<Theme>,
  parsedRule: ParsedRule,
) {
  return patternParser.chain(
    () =>
      new P.Parser((state) => {
        if (state.isError) return state;
        const { target, cursor } = state;
        const segment = target.slice(cursor);
        if (segment in context.colors) {
          const color = toColorValue(context.colors[segment]!, {
            opacityValue: parsedRule.m?.value ?? '1',
          });
          const declaration = {
            [property]: color,
          };
          return P.updateParserResult(state, declaration);
        }
        return P.updateParserError(state, {
          message: `Could not find color: ${segment}`,
          position: cursor,
        });
      }),
  );
}
