import * as P from '@native-twin/arc-parser';
import {
  ArbitraryToken,
  ClassNameToken,
  TWParsedRule,
  VariantClassToken,
  VariantToken,
} from '@native-twin/css';
import * as TwParser from '@native-twin/css/tailwind-parser';

type LocatedParser<A extends object> = {
  start: number;
  end: number;
} & A;

export interface GroupToken {
  type: 'GROUP';
  value: {
    base: LocatedParser<ClassNameToken> | LocatedParser<VariantToken>;
    content: (
      | LocatedParser<ClassNameToken>
      | LocatedParser<GroupToken>
      | LocatedParser<VariantClassToken>
      | LocatedParser<ArbitraryToken>
      | LocatedParser<VariantToken>
    )[];
  };
}

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

const parseValidTokenRecursiveWeak: P.Parser<
  | LocatedParser<GroupToken>
  | LocatedParser<VariantClassToken>
  | LocatedParser<ClassNameToken>
  | LocatedParser<VariantToken>
> = P.recursiveParser(() =>
  P.choice([parseRuleGroupWeak, parseVariantClass, parseVariant, parseClassName]),
);

/** Match any valid TW ident or arbitrary separated by spaces */
const parseGroupContentWeak: P.Parser<
  (
    | LocatedParser<GroupToken>
    | LocatedParser<VariantClassToken>
    | LocatedParser<ClassNameToken>
    | LocatedParser<ArbitraryToken>
    | LocatedParser<VariantToken>
  )[]
> = P.sequenceOf([
  P.char('('),
  P.many1(
    P.choice([parseValidTokenRecursiveWeak, parseArbitraryValue, P.skip(P.whitespace)]),
  ),
  P.maybe(P.char(')')),
]).map((x) => x[1].filter((x) => typeof x !== 'string' && x !== null));

const parseRuleGroupWeak: P.Parser<LocatedParser<GroupToken>> = P.choice([
  P.sequenceOf([parseVariant, parseGroupContentWeak]),
  P.sequenceOf([parseClassName, parseGroupContentWeak]),
]).mapFromState(
  (x, i): LocatedParser<GroupToken> =>
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

export const templateParser = (template: string) => {
  const weakParser = P.sequenceOf([
    P.separatedBySpace(parseValidTokenRecursiveWeak),
    P.endOfInput,
  ]).run(template);
  if (weakParser.isError) {
    return [];
  }
  return weakParser.result;
};

export type TemplateToken =
  | LocatedParser<GroupToken>
  | LocatedParser<VariantClassToken>
  | LocatedParser<VariantToken>
  | LocatedParser<ClassNameToken>
  | LocatedParser<ArbitraryToken>;

export const getTokenAtPosition = (tokens: TemplateToken[], position: number) => {
  const rangedTokens = tokens.filter((x) => position >= x.start && position <= x.end);
  return mergeParsedRuleGroupTokens(rangedTokens);
};

const extractClassName = (token: LocatedParser<ClassNameToken>) => ({
  n: token.value.n,
  v: [],
  i: token.value.i,
  m: token.value.m,
  p: 0,
  loc: { start: token.start, end: token.end },
});

const extractArbitrary = (token: LocatedParser<ArbitraryToken>) => ({
  n: token.value,
  v: [],
  i: false,
  m: null,
  p: 0,
  loc: { start: token.start, end: token.end },
});

const extractVariantClass = (token: LocatedParser<VariantClassToken>) => ({
  n: token.value[1].value.n,
  v: token.value[0].value.map((y) => y.n),
  i: token.value[1].value.i || token.value[0].value.some((y) => y.i),
  m: token.value[1].value.m,
  p: 0,
  loc: { start: token.start, end: token.end },
});

export function mergeParsedRuleGroupTokens(
  groupContent: TemplateToken[],
  results: TWParsedRule[] = [],
): TWParsedRule[] {
  const nextToken = groupContent.shift();
  if (!nextToken) return results;
  if (nextToken.type == 'ARBITRARY') {
    results.push(extractArbitrary(nextToken));
  }
  if (nextToken.type == 'CLASS_NAME') {
    results.push(extractClassName(nextToken));
  }
  if (nextToken.type == 'VARIANT_CLASS') {
    results.push(extractVariantClass(nextToken));
  }
  if (nextToken.type == 'GROUP') {
    const baseValue = nextToken.value.base;
    const parts = mergeParsedRuleGroupTokens(nextToken.value.content).map(
      (x): TWParsedRule => {
        if (baseValue.type == 'CLASS_NAME') {
          return {
            ...x,
            i: baseValue.value.i,
            m: baseValue.value.m,
            n: baseValue.value.n + '-' + x.n,
          };
        }
        return {
          ...x,
          v: [...x.v, ...baseValue.value.map((y) => y.n)],
          i: x.i || baseValue.value.some((y) => y.i),
        };
      },
    );
    results.push(...parts);
  }
  return mergeParsedRuleGroupTokens(groupContent, results);
}
