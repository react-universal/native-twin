import * as P from '@native-twin/arc-parser';
import { convert, ThemeContext } from '@native-twin/core';
import {
  ArbitraryToken,
  ClassNameToken,
  VariantClassToken,
  VariantToken,
  Layer as CssLayer,
  moveToLayer,
  parsedRuleToClassName,
} from '@native-twin/css';
import * as TwParser from '@native-twin/css/tailwind-parser';
import {
  LocatedGroupToken,
  LocatedParsedRule,
  LocatedParser,
  LocatedSheetEntry,
  TemplateToken,
} from './template.types';

const mapWithLocation = <A extends object>(
  x: P.ParserState<A, any>,
  initialIndex: number,
): LocatedParser<A> => ({
  ...x.result,
  start: initialIndex,
  end: x.cursor,
});

const parseVariant: P.Parser<LocatedParser<VariantToken>> =
  TwParser.parseVariant.mapFromState(mapWithLocation);

const parseClassName: P.Parser<LocatedParser<ClassNameToken>> =
  TwParser.parseClassName.mapFromState(mapWithLocation);
const parseVariantClass: P.Parser<LocatedParser<VariantClassToken>> =
  TwParser.parseVariantClass.mapFromState(mapWithLocation);
const parseArbitraryValue: P.Parser<LocatedParser<ArbitraryToken>> =
  TwParser.parseArbitraryValue.map(TwParser.mapArbitrary).mapFromState(mapWithLocation);

export const parseValidTokenRecursiveWeak: P.Parser<
  | LocatedParser<LocatedGroupToken>
  | LocatedParser<VariantClassToken>
  | LocatedParser<ClassNameToken>
  | LocatedParser<VariantToken>
> = P.recursiveParser(() =>
  P.choice([parseRuleGroupWeak, parseVariantClass, parseVariant, parseClassName]),
);

/** Match any valid TW ident or arbitrary separated by spaces */
const parseGroupContentWeak: P.Parser<TemplateToken[]> = P.sequenceOf([
  P.char('('),
  P.many1(
    P.choice([parseValidTokenRecursiveWeak, parseArbitraryValue, P.skip(P.whitespace)]),
  ),
  P.maybe(P.char(')')),
]).map((x) => {
  const newValue = x[1].filter((y): y is TemplateToken => typeof y !== 'string' && y !== null);
  return newValue;
});

const parseRuleGroupWeak: P.Parser<LocatedParser<LocatedGroupToken>> = P.choice([
  P.sequenceOf([parseVariant, parseGroupContentWeak]),
  P.sequenceOf([parseClassName, parseGroupContentWeak]),
]).mapFromState(
  (x, i): LocatedParser<LocatedGroupToken> =>
    mapWithLocation(
      {
        ...x,
        result: TwParser.mapGroup({
          base: x.result[0],
          content: x.result[1],
        }),
      },
      i,
    ),
);

const extractClassNameToken = (
  token: LocatedParser<ClassNameToken>,
): LocatedParsedRule => ({
  n: token.value.n,
  v: [],
  i: token.value.i,
  m: token.value.m,
  p: 0,
  loc: { start: token.start, end: token.end },
  type: token.type,
});

const extractArbitraryToken = (
  token: LocatedParser<ArbitraryToken>,
): LocatedParsedRule => ({
  n: token.value,
  v: [],
  i: false,
  m: null,
  p: 0,
  loc: { start: token.start, end: token.end },
  type: token.type,
});

const extractVariantClassToken = (
  token: LocatedParser<VariantClassToken>,
): LocatedParsedRule => ({
  n: token.value[1].value.n,
  v: token.value[0].value.map((y) => y.n),
  i: token.value[1].value.i || token.value[0].value.some((y) => y.i),
  m: token.value[1].value.m,
  p: 0,
  loc: { start: token.start, end: token.end },
  type: token.type,
});

export function mergeParsedRuleGroupTokens(
  groupContent: TemplateToken[],
  results: LocatedParsedRule[] = [],
): LocatedParsedRule[] {
  const nextToken = groupContent.shift();
  if (!nextToken) return results;
  if (nextToken.type == 'ARBITRARY') {
    results.push(extractArbitraryToken(nextToken));
  }
  if (nextToken.type == 'CLASS_NAME') {
    results.push(extractClassNameToken(nextToken));
  }
  if (nextToken.type == 'VARIANT_CLASS') {
    results.push(extractVariantClassToken(nextToken));
  }
  if (nextToken.type == 'GROUP') {
    const baseValue = nextToken.value.base;

    if (nextToken.value.content.length === 0) {
      if (baseValue.type === 'VARIANT') {
        for (const value of baseValue.value) {
          results.push({
            i: baseValue.value.some((x) => x.i),
            loc: {
              end: baseValue.end,
              start: baseValue.start,
            },
            m: null,
            n: '',
            p: 0,
            type: baseValue.type,
            v: [value.n],
          });
        }
      }
    }
    const parts = mergeParsedRuleGroupTokens(nextToken.value.content).map(
      (x): LocatedParsedRule => {
        if (baseValue.type == 'CLASS_NAME') {
          return {
            ...x,
            i: baseValue.value.i,
            m: baseValue.value.m,
            n: baseValue.value.n + '-' + x.n,
            type: baseValue.type,
            loc: {
              end: baseValue.end,
              start: baseValue.start,
            },
          };
        }
        return {
          ...x,
          v: [...x.v, ...baseValue.value.map((y) => y.n)],
          i: x.i || baseValue.value.some((y) => y.i),
          type: baseValue.type,
          loc: {
            end: baseValue.end,
            start: baseValue.start,
          },
        };
      },
    );
    results.push(...parts);
  }
  return mergeParsedRuleGroupTokens(groupContent, results);
}

export const getTokenAtPosition = (tokens: TemplateToken[], position: number) => {
  const rangedTokens = tokens
    .filter((x) => position >= x.start && position <= x.end)
    .map((x): TemplateToken => {
      if (x.type === 'VARIANT') {
        return {
          ...x,
          type: 'GROUP',
          value: {
            base: x,
            content: [],
          },
        };
      }
      return x;
    });
  return mergeParsedRuleGroupTokens(rangedTokens);
};

/**
 * Converts a parsed rule to a sheet entry based on the given context.
 *
 * @param {ParsedRule} rule - The parsed rule to convert.
 * @param {ThemeContext} context - The context in which the conversion is happening.
 * @return {SheetEntry} The converted sheet entry.
 */
export function locatedParsedRuleLocatedSheetEntry(
  rule: LocatedParsedRule,
  context: ThemeContext,
): LocatedSheetEntry {
  if (rule.n == 'group') {
    return {
      className: 'group',
      declarations: [],
      selectors: [],
      precedence: CssLayer.u,
      important: rule.i,
      loc: rule.loc,
    };
  }
  if (context.mode === 'web') {
    if (
      (rule.v.includes('ios') ||
        rule.v.includes('android') ||
        rule.v.includes('native')) &&
      !rule.v.includes('web')
    ) {
      return {
        className: parsedRuleToClassName(rule),
        declarations: [],
        selectors: [],
        precedence: CssLayer.u,
        important: rule.i,
        loc: rule.loc,
      };
    }
  }
  const result = context.r(rule);
  if (!result) {
    // propagate className as is
    return {
      className: parsedRuleToClassName(rule),
      declarations: [],
      selectors: [],
      precedence: CssLayer.u,
      important: rule.i,
      loc: rule.loc,
    };
  }
  const newRule = context.mode === 'web' ? convert(rule, context, CssLayer.u) : rule;
  result.selectors = newRule.v;
  result.precedence = moveToLayer(CssLayer.u, newRule.p);
  return { ...result, loc: rule.loc };
}
