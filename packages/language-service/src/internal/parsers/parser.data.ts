import type * as P from '@native-twin/arc-parser';
import { parsedRuleToClassName, type TWParsedRule } from '@native-twin/css';
import { hasOwnProperty } from '@native-twin/helpers';
import * as RA from 'effect/Array';
import { absurd, pipe } from 'effect/Function';
import * as Order from 'effect/Order';
import type * as TwinParserModel from '../../models/TwinParser.models';

const createComposedClass = (
  raw: TwinParserModel.AnyRawClassToken,
  parsed: TWParsedRule,
): TwinParserModel.ParsedRuleWithLocation => ({
  type: 'ParsedRuleWithLocation',
  fullText: parsedRuleToClassName(parsed),
  raw,
  parsed,
  endOffset: raw.endOffset,
  startOffset: raw.startOffset,
});

const isTokenType =
  <A extends string>(type: A) =>
  (token: unknown): token is { type: A } => {
    const isUndef = typeof token === 'undefined';
    return !isUndef && hasOwnProperty.call(token, 'type') && (token as any)['type'] === type;
  };

const isArbitraryToken = isTokenType('ARBITRARY');
const isClassNameToken = isTokenType('CLASS_NAME');
const isVariantClassToken = isTokenType('VARIANT_CLASS');
const isAnyTokenExceptGroup = (x: unknown) =>
  isClassNameToken(x) || isArbitraryToken(x) || isVariantClassToken(x);

export const Predicates = {
  isArbitraryToken,
  isClassNameToken,
  isVariantClassToken,
  isAnyTokenExceptGroup,
};

export const ComposedClass = {
  of: (...args: [raw: TwinParserModel.AnyRawClassToken, parsed: TWParsedRule]): TwinParserModel.ParsedRuleWithLocation =>
    createComposedClass(...args),

  createComposedClasses: (
    output: P.ResultType<TwinParserModel.AnyTwinParseResultToken[], TwinParserModel.TwinParserData>,
  ): TwinParserModel.TwinParserOutput => ({
    type: 'TwinParserOutput',
    endOffset: output.cursor,
    startOffset: output.data.input.startOffset,
    result: output.isError
      ? []
      : createComposedClasses(output.result, output.data.input.text, output.data.input.startOffset),
  }),
};

export const ParsedRule = {
  fromClassToken: (token: TwinParserModel.AnyTwinClassToken): TWParsedRule =>
    createParsedRule(token),

  mergeParsedRule: (partial: Partial<TWParsedRule>): TWParsedRule =>
    Object.assign({ n: '', v: [], i: false, m: null, p: 0 }, partial),

  order: Order.mapInput(Order.number, (x: TwinParserModel.ParsedRuleWithLocation) => x.startOffset),
  mapParserToLocation: <A extends object>(
    ...args: [x: P.ParserState<A, TwinParserModel.TwinParserData>, initialIndex: number]
  ): TwinParserModel.WithLocation & A => mapParserToLocation(...args),
};

const mapParserToLocation = <A extends object>(
  x: P.ParserState<A, TwinParserModel.TwinParserData>,
  initialIndex: number,
): TwinParserModel.WithLocation & A => ({
  ...x.result,
  startOffset: initialIndex,
  endOffset: x.cursor,
});

const createComposedClasses = (
  groupContent: TwinParserModel.AnyTwinClassToken[],
  text: string,
  parentStarts: number,
  results: TwinParserModel.ParsedRuleWithLocation[] = [],
): TwinParserModel.ParsedRuleWithLocation[] => {
  const nextToken = groupContent.shift();
  if (!nextToken) return pipe(results, RA.sortBy(ParsedRule.order));

  if (isAnyTokenExceptGroup(nextToken)) {
    const parsedRule = createParsedRule(nextToken);
    results.push(createComposedClass(nextToken, parsedRule));
    return createComposedClasses(groupContent, text, parentStarts, results);
  }

  if (nextToken.type === 'VARIANT') {
    return createComposedClasses(groupContent, text, parentStarts, results);
  }

  const baseValue = nextToken.base;
  const parts = createComposedClasses(nextToken.composes, text, parentStarts).map(
    (x): TwinParserModel.ParsedRuleWithLocation => {
      if (baseValue.type === 'CLASS_NAME') {
        const merged = ParsedRule.mergeParsedRule({
          ...x.parsed,
          i: baseValue.value.i,
          m: baseValue.value.m ?? x.parsed.m,
          n: `${baseValue.value.n}-${x.parsed.n}`,
        });
        return createComposedClass(x.raw, merged);
      }
      const merged = ParsedRule.mergeParsedRule({
        ...x.parsed,
        m: x.parsed.m,
        v: [...x.parsed.v, ...baseValue.value.map((y) => y.n)],
        i: x.parsed.i || baseValue.value.some((y) => y.i),
      });
      return createComposedClass(x.raw, merged);
    },
  );
  results.push(...parts);
  return createComposedClasses(groupContent, text, parentStarts, results);
};

const createParsedRule = (token: TwinParserModel.AnyTwinClassToken): TWParsedRule => {
  if (token.type === 'ARBITRARY') {
    return ParsedRule.mergeParsedRule({ n: token.value });
  }
  if (token.type === 'CLASS_NAME') {
    return ParsedRule.mergeParsedRule(token.value);
  }

  if (token.type === 'VARIANT_CLASS') {
    return ParsedRule.mergeParsedRule({
      ...token.value[1].value,
      v: token.value[0].value.map((y) => y.n),
      i: token.value[1].value.i || token.value[0].value.some((y) => y.i),
    });
  }
  console.warn('Unhandled type not allowed');
  absurd(token as never);
  return ParsedRule.mergeParsedRule({});
};

