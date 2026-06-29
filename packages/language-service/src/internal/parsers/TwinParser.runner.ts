import * as P from '@native-twin/arc-parser';
import * as TwParser from '@native-twin/css/twin-parser';
import { asArray } from '@native-twin/helpers';
import * as RA from 'effect/Array';
import { compose } from 'effect/Function';
import type * as TwinParserModel from '../../models/TwinParser.models';
import { ComposedClass, ParsedRule } from './parser.data';

export const parseTwinRules = (
  input: TwinParserModel.TwinParserInput,
): P.ResultType<TwinParserModel.AnyTwinParseResultToken[], TwinParserModel.TwinParserData> => {
  const withData = P.withData(
    P.many1(
      P.whitespaceSurrounded(
        P.choice([parseRuleGroupWeak, parseVariantClass, parseVariant, parseClassName]),
      ),
    ).map((r) =>
      r.flatMap((x) => {
        if (x === null) return [];
        if (Array.isArray(x)) return x;
        return asArray(x);
      }),
    ),
  );
  return withData<TwinParserModel.TwinParserData>({
    finalOffset: input.startOffset + input.text.length,
    syntaxError: [],
    input,
  }).run(input.text);
};

export const runTwinParser = compose(parseTwinRules, ComposedClass.createComposedClasses);

/** PARSER */

const parseVariant: TwinParserModel.ParserWithData<TwinParserModel.TwinClassVariantToken> =
  TwParser.parseVariant.mapFromState(ParsedRule.mapParserToLocation);

// P.either(parseVariant).map(x => x.)
/** Match color modifiers like: `.../10` or `.../[...]` */
const colorModifier = P.sequenceOf([
  P.char('/'),
  P.maybe(P.choice([P.digits, TwParser.parseArbitraryValue])),
]).map((x) => TwParser.mapColorModifier(x[1] ?? 'NONE'));

/** Match classnames with important prefix arbitrary and color modifiers */
const parseClassName: TwinParserModel.ParserWithData<TwinParserModel.TwinClassNameToken> =
  P.sequenceOf([
    TwParser.parseMaybeImportant,
    P.regex(TwParser.classNameIdent),
    P.maybe(TwParser.parseArbitraryValue),
    P.maybe(colorModifier),
  ])
    .map((x) => TwParser.mapClassName({ i: x[0], n: x[1] + (x[2] ? x[2] : ''), m: x[3] }))
    .mapFromState(ParsedRule.mapParserToLocation);

const parseVariantClass: TwinParserModel.ParserWithData<TwinParserModel.TwinClassNameVariantToken> =
  TwParser.parseVariantClass.mapFromState(ParsedRule.mapParserToLocation);

const parseArbitraryValue: TwinParserModel.ParserWithData<TwinParserModel.TwinArbitraryToken> =
  TwParser.parseArbitraryValue
    .map(TwParser.mapArbitrary)
    .mapFromState(ParsedRule.mapParserToLocation);

const parseValidTokenRecursiveWeak: TwinParserModel.ParserWithData<
  | TwinParserModel.TwinClassGroupToken
  | TwinParserModel.TwinClassVariantToken
  | TwinParserModel.TwinClassNameToken
  | TwinParserModel.TwinClassNameVariantToken
  | TwinParserModel.AnyRawClassToken[]
> = P.recursiveParser(() =>
  P.choice([
    parseRuleGroupWeak,
    parseVariantClass,
    skipTemplateLiterals,
    parseVariant,  
    parseClassName,
  ]),
);

/** Match any valid TW ident or arbitrary separated by spaces */
const parseGroupContentWeak: TwinParserModel.ParserWithData<TwinParserModel.AnyTwinClassToken[]> =
  P.sequenceOf([
    P.char('('),
    P.many1(P.choice([parseValidTokenRecursiveWeak, parseArbitraryValue, P.skip(P.whitespace)])),
    P.maybe(P.char(')')).mapFromState(
      (x: P.ParserState<string | null, TwinParserModel.TwinParserData>, initialIndex) => {
        if (typeof x.result === 'string') return x;
        x.data.syntaxError.push({
          startOffset: initialIndex,
          endOffset: x.cursor,
          reason: 'expecting ")" but it was not found',
          type: 'SyntaxError',
        });
        return P.updateParserData(x, { ...x.data });
      },
    ),
  ]).map((x) =>
    x[1].filter((y): y is TwinParserModel.AnyTwinClassToken => typeof y !== 'string' && y !== null),
  );

const parseRuleGroupWeak: TwinParserModel.ParserWithData<TwinParserModel.TwinClassGroupToken> =
  P.sequenceOf([
    P.choice([parseVariant, parseClassName]),
    parseGroupContentWeak.map((tokens) => RA.dedupe(tokens)),
  ]).mapFromState((x, i): TwinParserModel.TwinClassGroupToken => {
    const { type, value } = TwParser.mapGroup({ base: x.result[0], composes: x.result[1] });
    return ParsedRule.mapParserToLocation({ ...x, result: { type, ...value } }, i);
  });

const skipTemplateLiterals: TwinParserModel.ParserWithData<
  (
    | TwinParserModel.TwinClassGroupToken
    | TwinParserModel.TwinClassVariantToken
    | TwinParserModel.TwinClassNameToken
    | TwinParserModel.TwinClassNameVariantToken
  )[]
> = P.whitespaceSurrounded(
  P.sequenceOf([
    P.char('$'),
    P.between(P.char('{'))(P.char('}'))(
      P.many1(
        P.choice([
          P.between(P.choice([P.char("'"), P.char('"')]))(P.choice([P.char("'"), P.char('"')]))(
            parseValidTokenRecursiveWeak,
          ),
          P.skip(P.anyCharExcept(P.char('}'))),
        ]),
      ),
    ),
  ]),
).map((result) =>
  result[1].filter(
    (
      x,
    ): x is
      | TwinParserModel.TwinClassGroupToken
      | TwinParserModel.TwinClassVariantToken
      | TwinParserModel.TwinClassNameToken
      | TwinParserModel.TwinClassNameVariantToken => x !== null && typeof x !== 'string',
  ),
);
