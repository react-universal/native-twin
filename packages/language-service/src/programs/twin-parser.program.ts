import * as P from '@native-twin/arc-parser';
import { parsedRuleToClassName, type TWParsedRule } from '@native-twin/css';
import * as TwParser from '@native-twin/css/twin-parser';
import { hasOwnProperty } from '@native-twin/helpers';
import { absurd, Order, pipe } from 'effect';
import * as RA from 'effect/Array';
import type * as TwinParserModel from '../models/TwinParser.models';

type ParserWithData<A> = P.Parser<A, TwinParserModel.TwinParserData>;

const parseTwinClasses = (input: TwinParserModel.TwinParserInput) => {
  const withData = P.withData(
    P.many1(
      P.whitespaceSurrounded(
        P.choice([parseRuleGroupWeak, parseVariantClass, parseVariant, parseClassName]),
      ),
    ),
  );
  return withData({ ...input, syntaxError: [] });
};

interface ParsedWithLocation extends TwinParserModel.WithLocation {
  type: 'ParsedWithLocation';
  parsed: TWParsedRule;
  fullText: string;
  raw:
    | TwinParserModel.TwinClassNameToken
    | TwinParserModel.TwinClassNameVariantToken
    | TwinParserModel.TwinClassVariantToken
    | TwinParserModel.AnyTwinClassToken;
}

const createComposedClass = (
  raw:
    | TwinParserModel.TwinClassNameToken
    | TwinParserModel.TwinClassNameVariantToken
    | TwinParserModel.TwinClassVariantToken
    | TwinParserModel.AnyTwinClassToken,
  parsed: TWParsedRule,
): ParsedWithLocation => ({
  type: 'ParsedWithLocation',
  fullText: parsedRuleToClassName(parsed),
  raw,
  parsed,
  endOffset: raw.endOffset,
  startOffset: raw.startOffset,
});

const mergeParsedRule = (partial: Partial<TWParsedRule>): TWParsedRule =>
  Object.assign({ n: '', v: [], i: false, m: null, p: 0 }, partial);

const createParsedRule = (token: TwinParserModel.AnyTwinClassToken): TWParsedRule => {
  if (token.type === 'ARBITRARY') {
    return mergeParsedRule({ n: token.value });
  }
  if (token.type === 'CLASS_NAME') {
    return mergeParsedRule(token.value);
  }

  if (token.type === 'VARIANT_CLASS') {
    return mergeParsedRule({
      ...token.value[1].value,
      v: token.value[0].value.map((y) => y.n),
      i: token.value[1].value.i || token.value[0].value.some((y) => y.i),
    });
  }
  console.warn('Unhandled type not allowed');
  absurd(token as never);
  return mergeParsedRule({});
};

const parsedOrder = Order.mapInput(Order.number, (x: ParsedWithLocation) => x.startOffset);
export const createComposedClasses = (
  groupContent: TwinParserModel.AnyTwinClassToken[],
  text: string,
  parentStarts: number,
  results: ParsedWithLocation[] = [],
): ParsedWithLocation[] => {
  const nextToken = groupContent.shift();
  if (!nextToken) return pipe(results, RA.sortBy(parsedOrder));

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
    (x): ParsedWithLocation => {
      if (baseValue.type === 'CLASS_NAME') {
        const merged = mergeParsedRule({
          ...x.parsed,
          i: baseValue.value.i,
          m: baseValue.value.m ?? x.parsed.m,
          n: `${baseValue.value.n}-${x.parsed.n}`,
        });
        return createComposedClass(x.raw, merged);
      }
      const merged = mergeParsedRule({
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

export const testNewParser = (code: string) => {
  const result = parseTwinClasses({ startOffset: 0, text: code }).run(code);

  const input = result.data;
  const composedClasses: ParsedWithLocation[] = [];
  const evaluated = {
    startOffset: result.data.startOffset,
    endOffset: result.data.startOffset + result.cursor,
    composedClasses,
    originalInput: input,
  };
  if (result.isError) {
    return evaluated;
  }
  evaluated.composedClasses = createComposedClasses(result.result, input.text, input.startOffset);

  return evaluated;
};

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

/** PARSER */
const mapParserToLocation = <A extends object>(
  x: P.ParserState<A, TwinParserModel.TwinParserData>,
  initialIndex: number,
): TwinParserModel.WithLocation & A => ({
  ...x.result,
  startOffset: initialIndex,
  endOffset: x.cursor,
});

// const parseBetweenQuotes = P.between(P.maybe(P.choice([P.char('"'), P.char("'"), P.char("'")])))(
//   P.maybe(P.choice([P.char('"'), P.char("'"), P.char("'")])),
// );
const parseVariant: ParserWithData<TwinParserModel.TwinClassVariantToken> =
  TwParser.parseVariant.mapFromState(mapParserToLocation);

// P.either(parseVariant).map(x => x.)
/** Match color modifiers like: `.../10` or `.../[...]` */
const colorModifier = P.sequenceOf([
  P.char('/'),
  P.maybe(P.choice([P.digits, TwParser.parseArbitraryValue])),
]).map((x) => TwParser.mapColorModifier(x[1] ?? 'NONE'));

/** Match classnames with important prefix arbitrary and color modifiers */
const parseClassName: ParserWithData<TwinParserModel.TwinClassNameToken> = P.sequenceOf([
  TwParser.parseMaybeImportant,
  P.regex(TwParser.classNameIdent),
  P.maybe(TwParser.parseArbitraryValue),
  P.maybe(colorModifier),
])
  .map((x) => TwParser.mapClassName({ i: x[0], n: x[1] + (x[2] ? x[2] : ''), m: x[3] }))
  .mapFromState(mapParserToLocation);

const parseVariantClass: ParserWithData<TwinParserModel.TwinClassNameVariantToken> =
  TwParser.parseVariantClass.mapFromState(mapParserToLocation);

const parseArbitraryValue: ParserWithData<TwinParserModel.TwinArbitraryToken> =
  TwParser.parseArbitraryValue.map(TwParser.mapArbitrary).mapFromState(mapParserToLocation);

const parseValidTokenRecursiveWeak: ParserWithData<
  | TwinParserModel.TwinClassGroupToken
  | TwinParserModel.TwinClassVariantToken
  | TwinParserModel.TwinClassNameToken
  | TwinParserModel.TwinClassNameVariantToken
> = P.recursiveParser(() =>
  P.choice([parseRuleGroupWeak, parseVariantClass, parseVariant, parseClassName]),
);

/** Match any valid TW ident or arbitrary separated by spaces */
const parseGroupContentWeak: ParserWithData<TwinParserModel.AnyTwinClassToken[]> = P.sequenceOf([
  P.char('('),
  P.many1(P.choice([parseValidTokenRecursiveWeak, parseArbitraryValue, P.skip(P.whitespace)])),
  P.maybe(P.char(')')).mapFromState(
    (x: P.ParserState<string | null, TwinParserModel.TwinParserData>, initialIndex) => {
      if (typeof x.result === 'string') return x;
      x.data.syntaxError.push({
        startOffset: initialIndex,
        endOffset: x.cursor,
        reason: 'expecting ) but it was not found',
        type: 'SyntaxError',
      });
      return P.updateParserData(x, { ...x.data });
    },
  ),
]).map((x) => {
  const newValue = x[1].filter(
    (y): y is TwinParserModel.AnyTwinClassToken => typeof y !== 'string' && y !== null,
  );
  return newValue;
});

const parseRuleGroupWeak: ParserWithData<TwinParserModel.TwinClassGroupToken> = P.sequenceOf([
  P.choice([parseVariant, parseClassName]),
  parseGroupContentWeak.map((tokens) => {
    return RA.dedupe(tokens);
  }),
]).mapFromState((x, i): TwinParserModel.TwinClassGroupToken => {
  const { type, value } = TwParser.mapGroup({ base: x.result[0], composes: x.result[1] });
  return mapParserToLocation({ ...x, result: { type, ...value } }, i);
});
