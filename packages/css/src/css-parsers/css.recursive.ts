import type { FlexStyle, ShadowStyleIOS } from 'react-native';
import { evaluateDimensionsNode } from '../evaluators/dimensions.evaluator';
import { kebab2camel, resolveCssCalc } from '../helpers';
import { composed, number, parser, string } from '../lib';
import type { AnyStyle, AstDimensionsNode } from '../types';
import { getPropertyValueType, mapSelector } from './utils.parser';

/*
 ************ SELECTORS ***********
 */
const ParseCssSelector = string.everyCharUntil('{').map(mapSelector);

/*
 ************ DECLARATION PROPERTIES ***********
 */

const ParseDeclarationProperty = parser
  .sequenceOf([
    parser
      .many1(parser.choice([number.alphanumeric, string.char('-')]))
      .map((x) => x.join('')),
    string.char(':'),
  ])
  .map((x) => x[0]);

/*
 ************ DECLARATION VALUES ***********
 */

const CssColorParser = parser
  .sequenceOf([
    parser.choice([string.literal('rgba'), string.literal('hsl'), string.literal('#')]),
    composed.betweenParens(
      parser
        .many1(parser.choice([number.alphanumeric, string.char('.'), string.char(',')]))
        .map((x) => x.join('')),
    ),
  ])
  .map((x) => {
    return `${x[0]}(${x[1]})`;
  });

const DeclarationRawValueToken = parser
  .many1(parser.choice([string.letters, string.char('-')]))
  .map((x) => x.join(''));

const DeclarationUnit = parser.choice([
  string.literal('em'),
  string.literal('rem'),
  string.literal('px'),
  string.literal('%'),
  string.literal('cn'),
  string.literal('vh'),
  string.literal('vw'),
  string.literal('deg'),
  string.literal('ex'),
  string.literal('in'),
]);

const CssDimensionsParser = parser.recursiveParser(() =>
  parser.choice([DimensionWithUnitsParser, CssCalcParser]),
);

const DimensionWithUnitsParser = parser
  .sequenceOf([number.float, parser.maybe(DeclarationUnit)])
  .mapFromData(
    (x): AstDimensionsNode => ({
      type: 'DIMENSIONS',
      units: x.result[1] ?? 'none',
      value: parseFloat(x.result[0]),
    }),
  );

const CssCalcParser = parser
  .sequenceOf([
    string.literal('calc'),
    string.char('('),
    DimensionWithUnitsParser,
    parser.between(string.whitespace)(string.whitespace)(composed.parseMathOperatorSymbol),
    DimensionWithUnitsParser,
    string.char(')'),
  ])
  .mapFromData((x) => {
    return resolveCssCalc(x.result[2], x.result[3], x.result[4]);
  });

const FlexToken = composed
  .separatedBySpace(CssDimensionsParser)
  .mapFromData((x): FlexStyle => {
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

const DimensionNextSpace = parser
  .sequenceOf([CssDimensionsParser, string.whitespace])
  .map((x) => x[0]);

const ShadowValueToken = parser
  .many(
    parser.sequenceOf([
      parser.maybe(string.literal(', ')),
      // REQUIRED
      DimensionNextSpace,
      // REQUIRED
      parser.sequenceOf([CssDimensionsParser, string.whitespace]).map((x) => x[0]),
      // OPTIONAL
      parser.maybe(
        parser.sequenceOf([DimensionNextSpace, DimensionNextSpace, CssColorParser]),
      ),
    ]),
  )
  .mapFromData((x): ShadowStyleIOS => {
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

const TranslateValueToken = parser
  .sequenceOf([
    string.literal('translate'),
    string.char('('),
    CssDimensionsParser,
    parser.maybe(string.literal(', ')),
    parser.maybe(CssDimensionsParser),
    string.char(')'),
  ])
  .mapFromData((x) => {
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

const ParseCssDeclarationLine = parser.coroutine((run) => {
  const getValue = () => {
    const context = run(parser.getData);
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
    run(parser.maybe(string.char(';')));
    const isValid = run(parser.peek) !== '}';
    if (!isValid) return result;
    let value = {
      ...result,
      ...getValue(),
    };
    if (run(parser.peek) === ';') {
      return composeValue(value);
    }
    return value;
  };

  return composeValue();
});

export const CssParser = parser.withData(
  parser
    .sequenceOf([ParseCssSelector, composed.betweenBrackets(ParseCssDeclarationLine)])
    .map((x) => {
      return {
        selector: x[0],
        declarations: x[1],
      };
    }),
);
