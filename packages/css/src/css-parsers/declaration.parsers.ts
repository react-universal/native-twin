import { resolveCssCalc } from '../helpers';
import { parser } from '../lib';
import * as S from '../lib/common/string.parser';
import type {
  AstDeclarationNode,
  AstDimensionsNode,
  AstFlexNode,
  AstRawValueNode,
  AstShadowNode,
  AstTransformValueNode,
} from '../types';
import * as C from './common.parsers';

const DimensionsToken = parser.sequenceOf([S.float, C.DeclarationUnit]).map(
  (x): AstDimensionsNode => ({
    type: 'DIMENSIONS',
    value: parseFloat(x[0]),
    units: x[1] ?? 'none',
  }),
);

const NumberToken = S.float.map(
  (x): AstDimensionsNode => ({
    type: 'DIMENSIONS',
    value: parseFloat(x),
    units: 'none',
  }),
);

const ColorValueToken = parser
  .sequenceOf([
    C.DeclarationColor,
    C.betweenParens(parser.many1(parser.choice([S.alphanumeric, S.char('.'), S.char(',')]))),
  ])
  .map(
    (x): AstRawValueNode => ({
      type: 'RAW',
      value: x[0] + `(${x[1].join('')})`,
    }),
  );

const FlexToken = C.separatedBySpace(parser.choice([DimensionsToken, NumberToken])).map(
  (x): AstFlexNode => {
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
  },
);

const PropertyValidChars = parser
  .many1(parser.choice([S.alphanumeric, S.char('-')]))
  .map((x) => x.join(''));

const DeclarationPropertyToken = parser
  .sequenceOf([PropertyValidChars, S.char(':')])
  .map((x) => x[0]);

// parser.sequenceOf([
//   parser.choice([P.everyCharUntil(';'), P.everyCharUntil('}')]),
//   P.parser.maybe(S.char(';')),
// ])
const DeclarationRawValueToken = parser
  .many1(parser.choice([S.letters, S.char('-')]))
  .map((x): AstRawValueNode => {
    return {
      type: 'RAW',
      value: x.join(''),
    };
  });

const TranslateValueToken = parser
  .sequenceOf([
    C.translateKeyword,
    S.char('('),
    parser.choice([DimensionsToken, NumberToken]),
    parser.maybe(S.literal(', ')),
    parser.choice([DimensionsToken, NumberToken]),
    S.char(')'),
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
    C.calcKeyword,
    S.char('('),
    parser.choice([DimensionsToken, NumberToken]),
    parser.between(S.whitespace)(S.whitespace)(C.MathOperatorSymbol),
    parser.choice([DimensionsToken, NumberToken]),
    S.char(')'),
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
  .sequenceOf([parser.choice([DimensionsToken, NumberToken]), S.whitespace])
  .map((x) => x[0]);

const ShadowValueToken = parser
  .many(
    parser.sequenceOf([
      parser.maybe(S.literal(', ')),
      // REQUIRED
      DimensionNextSpace,
      // REQUIRED
      parser
        .sequenceOf([parser.choice([DimensionsToken, NumberToken]), S.whitespace])
        .map((x) => x[0]),
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
        DimensionsToken,
        DeclarationRawValueToken,
      ]),
    );
  }

  run(parser.maybe(S.char(';')));

  return {
    type: 'DECLARATION',
    property,
    value,
  };
});

export const DeclarationTokens = C.betweenBrackets(parser.many1(ParseDeclarationToken));
