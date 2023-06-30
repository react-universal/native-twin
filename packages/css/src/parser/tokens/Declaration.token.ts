import type {
  AstDeclarationNode,
  AstDimensionsNode,
  AstFlexNode,
  AstRawValueNode,
  AstShadowNode,
  AstTransformValueNode,
} from '../../types';
import * as P from '../Parser';
import * as S from '../Strings';
import { resolveCssCalc } from '../helpers';
import * as C from './Common.tokens';

const DimensionsToken = P.sequenceOf([S.float, C.DeclarationUnit]).map(
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

const ColorValueToken = P.sequenceOf([
  C.DeclarationColor,
  C.betweenParens(P.many1(P.choice([S.alphanumeric, S.char('.'), S.char(',')]))),
]).map(
  (x): AstRawValueNode => ({
    type: 'RAW',
    value: x[0] + `(${x[1].join('')})`,
  }),
);

const FlexToken = C.separatedBySpace(P.choice([DimensionsToken, NumberToken])).map(
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

const PropertyValidChars = P.many1(P.choice([S.alphanumeric, S.char('-')])).map((x) =>
  x.join(''),
);

const DeclarationPropertyToken = P.sequenceOf([PropertyValidChars, S.char(':')]).map(
  (x) => x[0],
);

// P.sequenceOf([
//   P.choice([P.everyCharUntil(';'), P.everyCharUntil('}')]),
//   P.possibly(S.char(';')),
// ])
const DeclarationRawValueToken = P.many1(P.choice([S.letters, S.char('-')])).map(
  (x): AstRawValueNode => {
    return {
      type: 'RAW',
      value: x.join(''),
    };
  },
);

const TranslateValueToken = P.sequenceOf([
  C.translateKeyword,
  S.char('('),
  P.choice([DimensionsToken, NumberToken]),
  P.possibly(S.literal(', ')),
  P.choice([DimensionsToken, NumberToken]),
  S.char(')'),
]).map((x): AstTransformValueNode => {
  return {
    dimension: '2d',
    type: 'TRANSFORM',
    x: x[2],
    ...(x[3] ? { y: x[4] } : {}),
  };
});

const CalcValueToken = P.sequenceOf([
  C.calcKeyword,
  S.char('('),
  P.choice([DimensionsToken, NumberToken]),
  P.between(S.whitespace)(S.whitespace)(C.MathOperatorSymbol),
  P.choice([DimensionsToken, NumberToken]),
  S.char(')'),
]).map((x): AstDimensionsNode => {
  return resolveCssCalc(x[2], x[3], x[4]);
});

// patterns
// Dimension Dimension Color; <offset-x> <offset-y> <color>
// Dimension Dimension Dimension Color; <offset-x> <offset-y> <shadow-radius> <color>
// Dimension Dimension Dimension Dimension Color; <offset-x> <offset-y> <shadow-radius> <spread-radius> <color>
// Dimension Dimension Color; <offset-x> <offset-y> <color>

const DimensionNextSpace = P.sequenceOf([
  P.choice([DimensionsToken, NumberToken]),
  S.whitespace,
]).map((x) => x[0]);

const ShadowValueToken = P.many(
  P.sequenceOf([
    P.possibly(S.literal(', ')),
    // REQUIRED
    DimensionNextSpace,
    // REQUIRED
    P.sequenceOf([P.choice([DimensionsToken, NumberToken]), S.whitespace]).map((x) => x[0]),
    // OPTIONAL
    P.possibly(P.sequenceOf([DimensionNextSpace, DimensionNextSpace, ColorValueToken])),
  ]),
).map(
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

export const ParseDeclarationToken = P.coroutine((run): AstDeclarationNode => {
  const property = run(DeclarationPropertyToken);

  let value: AstDeclarationNode['value'] | null = null;

  if (property === 'box-shadow') {
    value = run(ShadowValueToken);
    console.log('VALUE: ', value);
  }

  if (property === 'flex') {
    value = run(FlexToken);
  }

  if (property === 'transform') {
    value = run(TranslateValueToken);
  }

  if (value === null) {
    value = run(
      P.choice([CalcValueToken, ColorValueToken, DimensionsToken, DeclarationRawValueToken]),
    );
  }

  run(P.possibly(S.char(';')));

  return {
    type: 'DECLARATION',
    property,
    value,
  };
});

export const DeclarationTokens = C.betweenBrackets(P.many1(ParseDeclarationToken));
