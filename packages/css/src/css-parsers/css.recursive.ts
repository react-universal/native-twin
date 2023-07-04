import type { FlexStyle, ShadowStyleIOS } from 'react-native';
import { evaluateDimensionsNode } from '../evaluators/dimensions.evaluator';
import { kebab2camel, resolveCssCalc } from '../helpers';
import { composed, number, parser, string } from '../lib';
import type { AnyStyle, AstDeclarationNode, AstDimensionsNode, CssParserData } from '../types';
import { mapAsType, mapSelector } from './utils.parser';

/*
 ************ SELECTORS ***********
 */
const ParseCssSelector = string.everyCharUntil('{').map(mapSelector);

/*
 ************ DECLARATION PROPERTIES ***********
 */
const TransformProperty = string.literal('transform').map(mapAsType('TRANSFORM-PROP'));

const TopLeftBottomRightParser = <P extends string>(prefix: P) =>
  parser
    .sequenceOf([
      string.literal(prefix),
      string.char('-'),
      parser.choice([
        string.literal('top'),
        string.literal('left'),
        string.literal('bottom'),
        string.literal('right'),
      ]),
    ])
    .map((x) => x.join(''));

const MinMaxParser = <P extends string>(suffix: P) =>
  parser
    .sequenceOf([
      parser.choice([string.literal('min'), string.literal('max')]),
      string.char('-'),
      string.literal(suffix),
    ])
    .map((x) => x.join(''));

const SizeParser = <P extends string>(prefix: P) =>
  parser
    .sequenceOf([string.literal(prefix), string.char('-'), string.literal('size')])
    .map((x) => x.join(''));

const DimensionProperties = parser
  .choice([
    parser.choice([string.literal('width'), string.literal('height')]),
    parser.choice([MinMaxParser('width'), MinMaxParser('height')]),
    parser.choice([SizeParser('font'), string.literal('line-height')]),
    parser.choice([
      TopLeftBottomRightParser('margin'),
      TopLeftBottomRightParser('border'),
      TopLeftBottomRightParser('padding'),
    ]),
  ])
  .map(mapAsType('DIMENSIONS-PROP'));

const PropertyValidChars = parser
  .many1(parser.choice([number.alphanumeric, string.char('-')]))
  .map((x) => x.join(''))
  .map(mapAsType('RAW'));

const FlexProperty = string.literal('flex').map(mapAsType('FLEX-PROP'));
const ShadowProperty = string.literal('box-shadow').map(mapAsType('SHADOW-PROP'));

const ColorSuffixParser = parser
  .sequenceOf([string.letters, string.char('-'), string.literal('color')])
  .map((x) => x.join(''));

const ColorProperty = parser
  .choice([string.literal('color'), ColorSuffixParser])
  .map(mapAsType('COLOR-PROP'));

const ParseDeclarationProperty = parser
  .sequenceOf([
    parser.choice([
      DimensionProperties,
      ColorProperty,
      FlexProperty,
      ShadowProperty,
      TransformProperty,
      PropertyValidChars,
    ]),
    string.char(':'),
  ])
  .map((x) => x[0]);

/*
 ************ DECLARATION VALUES ***********
 */

const rgbaUnit = string.literal('rgba');
const hslUnit = string.literal('hsl');

const DeclarationColor = parser.choice([rgbaUnit, hslUnit]);

const CssColorParser = parser
  .sequenceOf([
    DeclarationColor,
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

// patterns
// Dimension Dimension Color; <offset-x> <offset-y> <color>
// Dimension Dimension Dimension Color; <offset-x> <offset-y> <shadow-radius> <color>
// Dimension Dimension Dimension Dimension Color; <offset-x> <offset-y> <shadow-radius> <spread-radius> <color>
// Dimension Dimension Color; <offset-x> <offset-y> <color>
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

const ParseCssDeclaration = parser.coroutine((run) => {});
/*
 ************ RULE BLOCK ***********
 */
const ParseCssRuleBlock = parser.coroutine((run) => {
  const context: CssParserData = run(parser.getData);
  run(string.char('{'));

  const declaration = parseDeclarations();
  run(string.char('}'));

  return declaration;

  function getNextProperty() {
    return run(ParseDeclarationProperty);
  }

  function parseDeclarations(result: AnyStyle = {}): AnyStyle {
    const isValid = run(parser.peek) !== '}';
    // console.log('IS_VALID: ', isValid);
    if (!isValid) return result;

    const property = getNextProperty();
    // console.log('DECLARATION-PROP: ', property);
    let value: AstDeclarationNode['value'] | null | any = null;

    if (property.type === 'RAW') {
      value = run(DeclarationRawValueToken);
      // console.log('RAW: ', value);
      Object.assign(result, {
        [kebab2camel(property.value)]: value,
      });
    }

    if (property.type === 'DIMENSIONS-PROP') {
      value = run(CssDimensionsParser.map((x) => evaluateDimensionsNode(x, context)));
      // console.log('DIMENSIONS-VALUE: ', value);
      Object.assign(result, {
        [kebab2camel(property.value)]: value,
      });
    }

    if (property.type === 'FLEX-PROP') {
      value = run(FlexToken);
      Object.assign(result, value);
    }
    if (property.type === 'SHADOW-PROP') {
      value = run(ShadowValueToken);
      Object.assign(result, value);
    }

    if (property.type === 'COLOR-PROP') {
      value = run(CssColorParser);
      Object.assign(result, {
        [kebab2camel(property.value)]: value,
      });
    }

    if (property.type === 'TRANSFORM-PROP') {
      value = run(TranslateValueToken);
      // console.log('TRANSFORM-VALUE: ', value);
      Object.assign(result, {
        [property.value]: value,
      });
    }

    const nextChar = run(parser.maybe(string.char(';')));
    if (nextChar) {
      return parseDeclarations(result);
    }
    return result;
  }
});

export const CssParser = parser.withData(
  parser.coroutine((run) => {
    const selector = getNextSelector();
    // console.log('SELECTOR: ', selector);
    const declarations = getNextRegularRule();
    // console.log('declarations: ', declarations);

    return { selector, declarations };

    function getNextSelector() {
      return run(ParseCssSelector);
    }

    function getNextRegularRule() {
      return run(ParseCssRuleBlock);
    }
  }),
);
