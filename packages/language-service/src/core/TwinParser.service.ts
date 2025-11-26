import * as P from '@native-twin/arc-parser';
import * as TwParser from '@native-twin/css/twin-parser';
import { asArray } from '@native-twin/helpers';
import * as RA from 'effect/Array';
import * as Cause from 'effect/Cause';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { compose } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Trie from 'effect/Trie';
import { createComposedClasses } from '../internal/TwinParser.internals';
import type * as TwinParserModel from '../models/TwinParser.models';
import { TwinRuntimeContext } from './TwinRuntime.service';

type ParserWithData<A> = P.Parser<A, TwinParserModel.TwinParserData>;

const parseTwinClasses = (input: TwinParserModel.TwinParserInput) => {
  const withData = P.withData(
    P.many1(
      P.whitespaceSurrounded(
        P.choice([parseRuleGroupWeak, parseVariantClass, parseVariant, parseClassName]),
      ),
    ),
  );
  return withData(input).run(input.text);
};

const make = Effect.gen(function* () {
  const { dictionaryRef, bootTwinRuntime, twinRef, styledContext, themeVariants } =
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

  const traverseComposition = Effect.fn(function* (
    composition: TwinParserModel.AnyTwinComposedClass,
  ): Effect.fn.Return<TwinParserModel.TwinComposedClassName[]> {
    if (composition.type === 'ComposedClass') return asArray(composition);

    const leadingToken = composition.token.base;
    const groups = (yield* Effect.all(
      composition.token.composes.flatMap((item) => {
        return traverseComposition(item);
      }),
    )).flat();

    return groups.flatMap((group) => {
      let newText = '';
      if (leadingToken.token.type === 'CLASS_NAME') {
        newText = newText.concat(leadingToken.text);
      }
      return Object.assign(group, { classNameText: newText.concat(group.text) });
    });
  });

  const runTwinParser = compose(parseTwinClasses, toTwinParserResult);
  const runTW = (classNames: string) => twinRef.get.pipe(Effect.andThen((fn) => fn(classNames)));

  return {
    data: { themeVariants, twinRef, styledContext, dictionaryRef },
    findRulesByKey,
    runTW,
    getRuleByClassName,
    runTwinParser,
    // findRulesByText,
  };
}).pipe(
  Effect.withSpan('TwinParserContext'),
  Effect.onError((error) => Effect.log('Error: ', Cause.prettyErrors(error))),
);

export const toTwinParserResult = (
  result: P.ResultType<TwinParserModel.AnyTwinParseResultToken[], TwinParserModel.TwinParserInput>,
): TwinParserModel.TwinParsedClasses => {
  const input = result.data;
  const composedClasses: TwinParserModel.AnyTwinComposedClass[] = [];
  const evaluated: TwinParserModel.TwinParsedClasses = {
    startOffset: result.data.startOffset,
    endOffset: result.data.startOffset + result.cursor,
    composedClasses,
    originalInput: input,
  };
  if (result.isError) return evaluated;
  evaluated.composedClasses = createComposedClasses(result.result, input.text, input.startOffset);

  return evaluated;
};

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
  P.maybe(P.char(')')),
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

export interface TwinParserContext extends Effect.Effect.Success<typeof make> {}
export const TwinParserContext = Context.GenericTag<TwinParserContext>('parsers/TwinParserContext');
export const TwinParserContextLive = Layer.effect(TwinParserContext, make);
