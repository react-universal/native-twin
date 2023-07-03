import { resolveCssCalc } from '../helpers';
import { parser, string, number } from '../lib';
import type {
  AstDeclarationNode,
  AstDimensionsNode,
  AstFlexNode,
  AstRawValueNode,
  AstShadowNode,
  AstTransformValueNode,
} from '../types';
import {
  betweenBrackets,
  betweenParens,
  calcKeyword,
  DeclarationColor,
  MathOperatorSymbol,
  separatedBySpace,
  translateKeyword,
} from './common.parsers';
import { CssDimensionsParser, CssUnitDimensionsParser } from './dimensions.parser';

const ColorValueToken = parser
  .sequenceOf([
    DeclarationColor,
    betweenParens(
      parser.many1(parser.choice([number.alphanumeric, string.char('.'), string.char(',')])),
    ),
  ])
  .map(
    (x): AstRawValueNode => ({
      type: 'RAW',
      value: x[0] + `(${x[1].join('')})`,
    }),
  );

const FlexToken = separatedBySpace(CssDimensionsParser).map((x): AstFlexNode => {
  let flexGrow: AstDimensionsNode = (x[0] as AstDimensionsNode) ?? {
    type: 'DIMENSIONS',
    units: 'none',
    value: 1,
  };
  let flexShrink = (x[1] as AstDimensionsNode) ?? {
    type: 'DIMENSIONS',
    units: 'none',
    value: 1,
  };
  let flexBasis = (x[2] as AstDimensionsNode) ?? {
    type: 'DIMENSIONS',
    units: '%',
    value: 1,
  };
  return {
    flexBasis,
    flexGrow,
    flexShrink,
    type: 'FLEX',
  };
});

const PropertyValidChars = parser
  .many1(parser.choice([number.alphanumeric, string.char('-')]))
  .map((x) => x.join(''));

const DeclarationPropertyToken = parser
  .sequenceOf([PropertyValidChars, string.char(':')])
  .map((x) => x[0]);

const DeclarationRawValueToken = parser
  .many1(parser.choice([string.letters, string.char('-')]))
  .map((x): AstRawValueNode => {
    return {
      type: 'RAW',
      value: x.join(''),
    };
  });

const TranslateValueToken = parser
  .sequenceOf([
    translateKeyword,
    string.char('('),
    CssDimensionsParser,
    parser.maybe(string.literal(', ')),
    CssDimensionsParser,
    string.char(')'),
  ])
  .map((x): AstTransformValueNode => {
    return {
      dimension: '2d',
      type: 'TRANSFORM',
      x: x[2],
      ...(x[3] ? { y: x[4] } : {}),
    };
  });

const CalcValueToken = parser
  .sequenceOf([
    calcKeyword,
    string.char('('),
    CssDimensionsParser,
    parser.between(string.whitespace)(string.whitespace)(MathOperatorSymbol),
    CssDimensionsParser,
    string.char(')'),
  ])
  .map((x): AstDimensionsNode => {
    return resolveCssCalc(x[2], x[3], x[4]);
  });

// patterns
// Dimension Dimension Color; <offset-x> <offset-y> <color>
// Dimension Dimension Dimension Color; <offset-x> <offset-y> <shadow-radius> <color>
// Dimension Dimension Dimension Dimension Color; <offset-x> <offset-y> <shadow-radius> <spread-radius> <color>
// Dimension Dimension Color; <offset-x> <offset-y> <color>

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
        parser.sequenceOf([DimensionNextSpace, DimensionNextSpace, ColorValueToken]),
      ),
    ]),
  )
  .map(
    (x): AstShadowNode => ({
      type: 'SHADOW',
      value: x.map((y) => ({
        offsetX: y[1],
        offsetY: y[2],
        shadowRadius: y[3]?.[0],
        spreadRadius: y[3]?.[1],
        color: y[3]?.[2],
      })),
    }),
  );

export const ParseDeclarationToken = parser.coroutine((run): AstDeclarationNode => {
  const property = run(DeclarationPropertyToken);

  let value: AstDeclarationNode['value'] | null = null;

  if (property === 'box-shadow') {
    value = run(ShadowValueToken);
  }

  if (property === 'flex') {
    value = run(FlexToken);
  }

  if (property === 'transform') {
    value = run(TranslateValueToken);
  }

  if (value === null) {
    value = run(
      parser.choice([
        CalcValueToken,
        ColorValueToken,
        CssUnitDimensionsParser,
        DeclarationRawValueToken,
      ]),
    );
  }

  run(parser.maybe(string.char(';')));

  return {
    type: 'DECLARATION',
    property,
    value,
  };
});

export const DeclarationTokens = betweenBrackets(parser.many1(ParseDeclarationToken));
