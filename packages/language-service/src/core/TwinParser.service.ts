import * as P from '@native-twin/arc-parser';
import * as TwParser from '@native-twin/css/twin-parser';
import * as RA from 'effect/Array';
import * as Cause from 'effect/Cause';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Trie from 'effect/Trie';
import * as LSP from '../internal/LSPAdapterSpec';
import * as Predicates from '../internal/TwinParser.internals';
import { createComposedClasses } from '../internal/TwinParser.internals';
import type * as TwinParserModel from '../models/TwinParser.models';
import { TwinRuntimeContext } from './TwinRuntime.service';

export interface TwinParserInput {
  text: string;
  docPosition: LSP.LSPPosition;
}
export interface TwinParsedClasses {
  inputRange: LSP.LSPRange;
  originalInput: TwinParserInput;
  composedClasses: TwinParserModel.AnyTwinComposedClass[];
}
interface TwinParserData {
  input: TwinParserInput;
  originalInput: TwinParserInput;
}
type ParserWithData<A> = P.Parser<A, TwinParserData>;

const parseTwinClasses = ({
  input,
  originalInput,
}: {
  input: TwinParserInput;
  originalInput: TwinParserInput;
}) => {
  const withData = P.withData(
    P.many1(
      P.whitespaceSurrounded(
        P.choice([parseRuleGroupWeak, parseVariantClass, parseVariant, parseClassName]),
      ),
    ),
  );
  return withData({ input, originalInput }).run(input.text);
};

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

  const runTwinParser = (rawText: string, startsAt: LSP.LSPPosition): TwinParsedClasses => {
    const { text, position } = adjustParserInput(rawText, startsAt);
    const parsed = parseTwinClasses({
      input: { text, docPosition: position },
      originalInput: { text: rawText, docPosition: startsAt },
    });

    return toTwinParserResult(parsed);
  };

  const findComposedClassAtPosition = (
    nodes: TwinParserModel.AnyTwinComposedClass[],
    offset: number,
  ) => {
    for (const node of nodes) {
      if (!Predicates.isComposedNodeAtOffset(node, offset)) continue;

      if (Predicates.isComposedNodeAtOffset(node, offset) && node.type === 'ComposedClass') {
        return {
          node,
          fullLoc: node.documentLoc,
          group: null,
          lookupText: node.classNameText,
        };
      }

      if (Predicates.isComposedClassGroup(node)) {
        const targetComposition = node.token.composes.find((_) =>
          Predicates.isComposedNodeAtOffset(_, offset),
        );
        if (!targetComposition) return null;

        const base = node.token.base.classNameText;

        let lookupText = '';
        if (node.token.base.token.type === 'CLASS_NAME') {
          lookupText += base;
          if (!base.endsWith('-')) {
            lookupText += '-';
          }
        }
        if (targetComposition.type === 'ComposedClass') {
          lookupText += targetComposition.text;
        }
        return {
          fullLoc: node.documentLoc,
          group: node.token.base,
          node: targetComposition,
          lookupText,
        };
      }
    }
  };

  return {
    data: { themeVariants, styledContext, twinRef, dictionaryRef },
    findRulesByKey,
    getRuleByClassName,
    findComposedClassAtPosition,
    runTwinParser,
    findRulesByText,
  };
}).pipe(
  Effect.withSpan('TwinParserContext'),
  Effect.onError((error) => Effect.log('Error: ', Cause.prettyErrors(error))),
);

export const toTwinParserResult = (
  result: P.ResultType<
    TwinParserModel.AnyTwinParseResultToken[],
    { input: TwinParserInput; originalInput: TwinParserInput }
  >,
): TwinParsedClasses => {
  const { input, originalInput } = result.data;
  const inputRange: LSP.LSPRange = {
    start: input.docPosition,
    end: LSP.position(input.docPosition.character + input.text.length, input.docPosition.line),
  };
  const composedClasses: TwinParserModel.AnyTwinComposedClass[] = [];
  const evaluated: TwinParsedClasses = {
    inputRange,
    originalInput,
    composedClasses,
  };
  if (result.isError) return evaluated;
  evaluated.composedClasses = createComposedClasses(
    result.result,
    input.text,
    input.docPosition.character,
  );

  return evaluated;
};

/** PARSER */

const adjustParserInput = (rawText: string, startsAt: LSP.LSPPosition) => {
  const replacementToken = ["'", '`', '{', '}', '"'].filter((_) => rawText.includes(_)) ?? '';
  let finalText = rawText;
  for (const replacement of replacementToken) {
    finalText = finalText.replaceAll(new RegExp(replacement, 'g'), '');
  }
  return {
    text: finalText,
    position: LSP.position(startsAt.character + replacementToken.length, startsAt.line),
  };
};

const mapParserToLocation = <A extends object>(
  x: P.ParserState<A, TwinParserData>,
  initialIndex: number,
): TwinParserModel.WithLocation & A =>
  Object.assign(x.result, {
    range: LSP.range(
      LSP.position(initialIndex, x.data.originalInput.docPosition.line),
      LSP.position(x.cursor, x.data.originalInput.docPosition.line),
    ),
    originalRange: LSP.range(
      LSP.position(
        x.data.input.docPosition.character + initialIndex,
        x.data.input.docPosition.line,
      ),
      LSP.position(x.data.input.docPosition.character + x.cursor, x.data.input.docPosition.line),
    ),
  });

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

const parseRuleGroupWeak: ParserWithData<TwinParserModel.TwinClassGroupToken> = P.choice([
  P.sequenceOf([parseVariant, parseGroupContentWeak]),
  P.sequenceOf([parseClassName, parseGroupContentWeak]),
]).mapFromState((x, i): TwinParserModel.TwinClassGroupToken => {
  const { type, value } = TwParser.mapGroup({ base: x.result[0], composes: x.result[1] });
  return mapParserToLocation({ ...x, result: { type, ...value } }, i);
});

export interface TwinParserContext extends Effect.Effect.Success<typeof make> {}
export const TwinParserContext = Context.GenericTag<TwinParserContext>('parsers/TwinParserContext');
export const TwinParserContextLive = Layer.effect(TwinParserContext, make);
