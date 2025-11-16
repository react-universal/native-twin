import * as P from '@native-twin/arc-parser';
import { setup } from '@native-twin/core';
import * as TwParser from '@native-twin/css/twin-parser';
import { flattenObjectByPath } from '@native-twin/helpers';
import * as RA from 'effect/Array';
import * as Cause from 'effect/Cause';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Ref from 'effect/Ref';
import * as Stream from 'effect/Stream';
import * as Trie from 'effect/Trie';
import type { InternalTwFn, InternalTwinConfig } from '../models/twin/native-twin.types';
import { requireJS } from '../utils/load-js';
import { createStyledContext } from '../utils/sheet.utils';
import * as TwinParserModel from './models/TwinParser.models';
import { TwinRuleComposer } from './models/TwinRuleHandler';
import * as TwinUtils from './TwinParser.utils';

const make = Effect.gen(function* () {
  const twinRef = yield* Ref.make<Option.Option<InternalTwFn>>(Option.none());
  const dictionaryRef = yield* Ref.make(Trie.empty<TwinParserModel.TwinRuleRegistry>());

  const getTwin = <Y>(cb: (twin: InternalTwFn) => Y): Effect.Effect<Option.Option<Y>> => {
    return twinRef.get.pipe(Effect.map((twin) => Option.map(twin, cb)));
  };
  const styledContext = getTwin((twin) => createStyledContext(twin.config.root.rem));
  const themeVariants = getTwin((twin) => TwinUtils.getThemeVariants(twin.config));

  const resolveThemeSection = yield* Effect.cachedFunction(
    (section: keyof InternalTwinConfig['theme']) =>
      getTwin((twin) => flattenObjectByPath(twin.theme(section))),
  );

  const findRulesByKey = Effect.fn(function* (key: string) {
    if (key.length === 0) return [] as TwinParserModel.TwinRuleRegistry[];
    return RA.fromIterable(Trie.valuesWithPrefix(yield* dictionaryRef.get, key));
  });

  return {
    data: { themeVariants, styledContext, twinRef, dictionaryRef },
    findRulesByKey,
    loadTwinConfig,
    runTwinParser: (rawText: string, startsAt: number) => {
      const { text, position } = adjustParserInput(rawText, startsAt);
      const parsed = P.many1(
        P.whitespaceSurrounded(
          P.choice([parseRuleGroupWeak, parseVariantClass, parseVariant, parseClassName]),
        ),
      ).run(text);

      return new TwinParserModel.TwinParseResultHandler(parsed, { text, position });
    },
  };

  function loadTwinConfig(twinPath: string) {
    const twinConfig = requireJS(twinPath).pipe(Option.getOrNull);
    if (!twinConfig) return Effect.void;
    return Ref.set(twinRef, Option.some(setup(twinConfig))).pipe(
      Effect.andThen(() => createRuleCompositions()),
      Effect.andThen((trie) => Ref.set(dictionaryRef, trie)),
    );
  }

  function createRuleCompositions() {
    return Stream.fromEffect(twinRef.get).pipe(
      Stream.filterMap((x) => Option.map(x, (_) => _.config.rules)),
      Stream.flattenIterables,
      Stream.flatMap((raw) => composeTwinRule(new TwinRuleComposer(raw))),
      Stream.runFold(Trie.empty<TwinParserModel.TwinRuleRegistry>(), (trie, current) =>
        Trie.insert(trie, current.className, current),
      ),
    );
  }

  function composeTwinRule(
    composer: TwinRuleComposer,
  ): Stream.Stream<TwinParserModel.TwinRuleRegistry> {
    return Stream.fromIterable(composer.compositions).pipe(
      Stream.mapEffect((composition) =>
        resolveThemeSection(composer.themeSection as any).pipe(
          Effect.andThen(Option.getOrElse(() => ({}))),
          Effect.andThen((themeConfig) =>
            composer.createClassNamesCollection(
              composer.compositions.indexOf(composition),
              themeConfig,
            ),
          ),
        ),
      ),
      Stream.flattenIterables,
    );
  }
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
