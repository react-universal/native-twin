import * as P from '@native-twin/arc-parser';
import * as TwParser from '@native-twin/css/twin-parser';
import * as RA from 'effect/Array';
import * as Cause from 'effect/Cause';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Trie from 'effect/Trie';
import * as TwinParserModel from '../models/TwinParser.models';
import { TwinRuntimeContext } from './TwinRuntime.service';

const make = Effect.gen(function* () {
  const { dictionaryRef, bootTwinRuntime, findRulesByText, twinRef, styledContext, themeVariants } =
    yield* TwinRuntimeContext;
  yield* bootTwinRuntime();

  const findRulesByKey = Effect.fn(function* (key: string) {
    const dictionary = yield* dictionaryRef.get;
    if (key.length === 0) return [] as TwinParserModel.TwinRuleRegistry[];
    return RA.fromIterable(Trie.valuesWithPrefix(dictionary, key));
  });

  const getRuleByClassName = Effect.fn(function* (key: string) {
    const dictionary = yield* dictionaryRef.get;
    if (key.length === 0) return Option.none<TwinParserModel.TwinRuleRegistry>();
    return Trie.get(dictionary, key);
  });

  const runTwinParser = (rawText: string, startsAt: number) => {
    const { text, position } = adjustParserInput(rawText, startsAt);
    const parsed = P.many1(
      P.whitespaceSurrounded(
        P.choice([parseRuleGroupWeak, parseVariantClass, parseVariant, parseClassName]),
      ),
    ).run(text);

    return new TwinParserModel.TwinParseResultHandler(parsed, { text, position });
  };

  return {
    data: { themeVariants, styledContext, twinRef, dictionaryRef },
    findRulesByKey,
    getRuleByClassName,
    runTwinParser,
    findRulesByText,
  };
}).pipe(
  Effect.withSpan('TwinParserContext'),
  Effect.onError((error) => Effect.log('Error: ', Cause.prettyErrors(error))),
);

/** PARSER */
const adjustParserInput = (rawText: string, startsAt: number) => {
  const replacementToken = ["'", '`'].find((_) => rawText.startsWith(_)) ?? '';
  return {
    text: rawText.length > 0 ? rawText.replace(replacementToken, '') : rawText,
    position: startsAt + replacementToken.length,
  };
};

const mapParserToLocation = <A extends object, S = unknown>(
  x: P.ParserState<A, S>,
  initialIndex: number,
): TwinParserModel.WithLocation & A =>
  Object.assign(x.result, {
    start: initialIndex,
    end: x.cursor,
  });

const parseVariant: P.Parser<TwinParserModel.TwinClassVariantToken> =
  TwParser.parseVariant.mapFromState(mapParserToLocation);

/** Match color modifiers like: `.../10` or `.../[...]` */
const colorModifier = P.sequenceOf([
  P.char('/'),
  P.maybe(P.choice([P.digits, TwParser.parseArbitraryValue])),
]).map((x) => TwParser.mapColorModifier(x[1] ?? 'NONE'));

/** Match classnames with important prefix arbitrary and color modifiers */
const parseClassName: P.Parser<TwinParserModel.TwinClassNameToken> = P.sequenceOf([
  TwParser.parseMaybeImportant,
  P.regex(TwParser.classNameIdent),
  P.maybe(TwParser.parseArbitraryValue),
  P.maybe(colorModifier),
])
  .map((x) => TwParser.mapClassName({ i: x[0], n: x[1] + (x[2] ? x[2] : ''), m: x[3] }))
  .mapFromState(mapParserToLocation);

const parseVariantClass: P.Parser<TwinParserModel.TwinClassNameVariantToken> =
  TwParser.parseVariantClass.mapFromState(mapParserToLocation);

const parseArbitraryValue: P.Parser<TwinParserModel.TwinArbitraryToken> =
  TwParser.parseArbitraryValue.map(TwParser.mapArbitrary).mapFromState(mapParserToLocation);

const parseValidTokenRecursiveWeak: P.Parser<
  | TwinParserModel.TwinClassGroupToken
  | TwinParserModel.TwinClassVariantToken
  | TwinParserModel.TwinClassNameToken
  | TwinParserModel.TwinClassNameVariantToken
> = P.recursiveParser(() =>
  P.choice([parseRuleGroupWeak, parseVariantClass, parseVariant, parseClassName]),
);

/** Match any valid TW ident or arbitrary separated by spaces */
const parseGroupContentWeak: P.Parser<TwinParserModel.AnyTwinClassToken[]> = P.sequenceOf([
  P.char('('),
  P.many1(P.choice([parseValidTokenRecursiveWeak, parseArbitraryValue, P.skip(P.whitespace)])),
  P.maybe(P.char(')')),
]).map((x) => {
  const newValue = x[1].filter(
    (y): y is TwinParserModel.AnyTwinClassToken => typeof y !== 'string' && y !== null,
  );
  return newValue;
});

const parseRuleGroupWeak: P.Parser<TwinParserModel.TwinClassGroupToken> = P.choice([
  P.sequenceOf([parseVariant, parseGroupContentWeak]),
  P.sequenceOf([parseClassName, parseGroupContentWeak]),
]).mapFromState((x, i): TwinParserModel.TwinClassGroupToken => {
  const { type, value } = TwParser.mapGroup({ base: x.result[0], composes: x.result[1] });
  return mapParserToLocation({ ...x, result: { type, ...value } }, i);
});

export interface TwinParserContext extends Effect.Effect.Success<typeof make> {}
export const TwinParserContext = Context.GenericTag<TwinParserContext>('parsers/TwinParserContext');
export const TwinParserContextLive = Layer.effect(TwinParserContext, make);
