import type { FlexStyle, ShadowStyleIOS } from 'react-native';
import { evaluateMediaQueryConstrains } from '../evaluators/at-rule.evaluator';
import { evaluateDimensionsNode } from '../evaluators/dimensions.evaluator';
import { kebab2camel, resolveCssCalc } from '../helpers';
import {
  alphanumeric,
  between,
  betweenBrackets,
  betweenParens,
  char,
  choice,
  coroutine,
  everyCharUntil,
  float,
  getData,
  letters,
  literal,
  many,
  many1,
  maybe,
  parseMathOperatorSymbol,
  peek,
  recursiveParser,
  separatedBySpace,
  sequenceOf,
  whitespace,
} from '../lib';
import type { AnyStyle, AstDimensionsNode } from '../types';
import { getPropertyValueType, mapSelector } from './utils.parser';

/*
 ************ SELECTORS ***********
 */
const ParseCssSelector = everyCharUntil('{').map(mapSelector);

/*
 ************ DECLARATION PROPERTIES ***********
 */

const ParseDeclarationProperty = sequenceOf([
  many1(choice([alphanumeric, char('-')])).map((x) => x.join('')),
  char(':'),
]).map((x) => x[0]);

/*
 ************ DECLARATION VALUES ***********
 */

const CssColorParser = sequenceOf([
  choice([literal('rgba'), literal('hsl'), literal('#')]),
  betweenParens(many1(choice([alphanumeric, char('.'), char(',')])).map((x) => x.join(''))),
]).map((x) => {
  return `${x[0]}(${x[1]})`;
});

const DeclarationRawValueToken = many1(choice([letters, char('-')])).map((x) => x.join(''));

const DeclarationUnit = choice([
  literal('em'),
  literal('rem'),
  literal('px'),
  literal('%'),
  literal('cn'),
  literal('vh'),
  literal('vw'),
  literal('deg'),
  literal('ex'),
  literal('in'),
]);

const CssDimensionsParser = recursiveParser(() =>
  choice([DimensionWithUnitsParser, CssCalcParser]),
);

const DimensionWithUnitsParser = sequenceOf([float, maybe(DeclarationUnit)]).mapFromData(
  (x): AstDimensionsNode => ({
    type: 'DIMENSIONS',
    units: x.result[1] ?? 'none',
    value: parseFloat(x.result[0]),
  }),
);

const CssCalcParser = sequenceOf([
  literal('calc'),
  char('('),
  DimensionWithUnitsParser,
  between(whitespace)(whitespace)(parseMathOperatorSymbol),
  DimensionWithUnitsParser,
  char(')'),
]).mapFromData((x) => {
  return resolveCssCalc(x.result[2], x.result[3], x.result[4]);
});

const FlexToken = separatedBySpace(CssDimensionsParser).mapFromData((x): FlexStyle => {
  return x.result.reduce(
    (prev, current, index) => {
      if (index === 0) {
        prev.flexShrink = evaluateDimensionsNode(current, x.data);
      }
      if (index === 1) {
        prev.flexShrink = evaluateDimensionsNode(current, x.data);
      }
      if (index === 2) {
        prev.flexBasis = evaluateDimensionsNode(current, x.data);
      }
      return prev;
    },
    {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: '0%',
    } as FlexStyle,
  );
});

const DimensionNextSpace = sequenceOf([CssDimensionsParser, whitespace]).map((x) => x[0]);

const ShadowValueToken = many(
  sequenceOf([
    maybe(literal(', ')),
    // REQUIRED
    DimensionNextSpace,
    // REQUIRED
    sequenceOf([CssDimensionsParser, whitespace]).map((x) => x[0]),
    // OPTIONAL
    maybe(sequenceOf([DimensionNextSpace, DimensionNextSpace, CssColorParser])),
  ]),
).mapFromData((x): ShadowStyleIOS => {
  const shadow = x.result[0]!;
  return {
    shadowOffset: {
      width: evaluateDimensionsNode(shadow[1], x.data),
      height: evaluateDimensionsNode(shadow[2], x.data),
    },
    shadowRadius: shadow[3]?.[0] && evaluateDimensionsNode(shadow[3]![0], x.data),
    shadowOpacity: shadow[3]?.[1] && evaluateDimensionsNode(shadow[3]![1], x.data),
    shadowColor: shadow[3]?.[2],
  };
});

const TranslateValueToken = sequenceOf([
  literal('translate'),
  char('('),
  CssDimensionsParser,
  maybe(literal(', ')),
  maybe(CssDimensionsParser),
  char(')'),
]).mapFromData((x) => {
  const styles: AnyStyle['transform'] = [
    { translateX: evaluateDimensionsNode(x.result[2], x.data) },
  ];
  if (x.result[4]) {
    styles.push({
      translateY: evaluateDimensionsNode(x.result[4], x.data),
    });
  }
  return styles;
});

/*
 ************ RULE BLOCK ***********
 */

const ParseCssDeclarationLine = coroutine((run) => {
  const getValue = () => {
    const context = run(getData);
    const property = run(ParseDeclarationProperty);
    const meta = getPropertyValueType(property);
    if (meta === 'DIMENSION') {
      return {
        [kebab2camel(property)]: evaluateDimensionsNode(run(CssDimensionsParser), context),
      };
    }
    if (meta === 'FLEX') {
      return run(FlexToken);
    }

    if (meta === 'SHADOW') {
      return run(ShadowValueToken);
    }

    if (meta === 'TRANSFORM') {
      return {
        transform: run(TranslateValueToken),
      };
    }

    if (meta === 'COLOR') {
      const value = run(CssColorParser);
      return {
        [kebab2camel(property)]: value,
      };
    }
    return {
      [kebab2camel(property)]: run(DeclarationRawValueToken),
    };
  };

  const composeValue = (result: AnyStyle = {}): AnyStyle => {
    run(maybe(char(';')));
    const isValid = run(peek) !== '}';
    if (!isValid) return result;
    let value = {
      ...result,
      ...getValue(),
    };
    if (run(peek) === ';') {
      return composeValue(value);
    }
    return value;
  };

  return composeValue();
});

export const CssParser = recursiveParser(() => choice([AtRuleParser, RuleBlockParser]));

const GetAtRuleConditionToken = sequenceOf([ParseDeclarationProperty, CssDimensionsParser]);

const AtRuleParser = coroutine((run) => {
  const context = run(getData);
  run(literal('@media'));
  run(whitespace);
  const mediaRuleConstrains = run(betweenParens(GetAtRuleConditionToken));
  if (
    evaluateMediaQueryConstrains(
      { property: mediaRuleConstrains[0], value: mediaRuleConstrains[1] },
      context,
    )
  ) {
    const rule = run(betweenBrackets(RuleBlockParser));
    return rule;
  }
  return null;
});

const RuleBlockParser = sequenceOf([
  ParseCssSelector,
  betweenBrackets(ParseCssDeclarationLine),
]).map((x) => {
  return {
    selector: x[0],
    declarations: x[1],
  };
});
