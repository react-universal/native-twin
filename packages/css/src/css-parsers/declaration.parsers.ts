import { possibly } from '../lib/Parser';
import { between } from '../lib/between.parser';
import { choice } from '../lib/choice.parser';
import { coroutine } from '../lib/coroutine.parser';
import { resolveCssCalc } from '../lib/helpers';
import { many, many1 } from '../lib/many.parser';
import { sequenceOf } from '../lib/sequence-of';
import * as S from '../lib/string.parser';
import type {
  AstDeclarationNode,
  AstDimensionsNode,
  AstFlexNode,
  AstRawValueNode,
  AstShadowNode,
  AstTransformValueNode,
} from '../types';
import * as C from './common.parsers';

const DimensionsToken = sequenceOf([S.float, C.DeclarationUnit]).map(
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

const ColorValueToken = sequenceOf([
  C.DeclarationColor,
  C.betweenParens(many1(choice([S.alphanumeric, S.char('.'), S.char(',')]))),
]).map(
  (x): AstRawValueNode => ({
    type: 'RAW',
    value: x[0] + `(${x[1].join('')})`,
  }),
);

const FlexToken = C.separatedBySpace(choice([DimensionsToken, NumberToken])).map(
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

const PropertyValidChars = many1(choice([S.alphanumeric, S.char('-')])).map((x) => x.join(''));

const DeclarationPropertyToken = sequenceOf([PropertyValidChars, S.char(':')]).map(
  (x) => x[0],
);

// sequenceOf([
//   choice([P.everyCharUntil(';'), P.everyCharUntil('}')]),
//   P.possibly(S.char(';')),
// ])
const DeclarationRawValueToken = many1(choice([S.letters, S.char('-')])).map(
  (x): AstRawValueNode => {
    return {
      type: 'RAW',
      value: x.join(''),
    };
  },
);

const TranslateValueToken = sequenceOf([
  C.translateKeyword,
  S.char('('),
  choice([DimensionsToken, NumberToken]),
  possibly(S.literal(', ')),
  choice([DimensionsToken, NumberToken]),
  S.char(')'),
]).map((x): AstTransformValueNode => {
  return {
    dimension: '2d',
    type: 'TRANSFORM',
    x: x[2],
    ...(x[3] ? { y: x[4] } : {}),
  };
});

const CalcValueToken = sequenceOf([
  C.calcKeyword,
  S.char('('),
  choice([DimensionsToken, NumberToken]),
  between(S.whitespace)(S.whitespace)(C.MathOperatorSymbol),
  choice([DimensionsToken, NumberToken]),
  S.char(')'),
]).map((x): AstDimensionsNode => {
  return resolveCssCalc(x[2], x[3], x[4]);
});

// patterns
// Dimension Dimension Color; <offset-x> <offset-y> <color>
// Dimension Dimension Dimension Color; <offset-x> <offset-y> <shadow-radius> <color>
// Dimension Dimension Dimension Dimension Color; <offset-x> <offset-y> <shadow-radius> <spread-radius> <color>
// Dimension Dimension Color; <offset-x> <offset-y> <color>

const DimensionNextSpace = sequenceOf([
  choice([DimensionsToken, NumberToken]),
  S.whitespace,
]).map((x) => x[0]);

const ShadowValueToken = many(
  sequenceOf([
    possibly(S.literal(', ')),
    // REQUIRED
    DimensionNextSpace,
    // REQUIRED
    sequenceOf([choice([DimensionsToken, NumberToken]), S.whitespace]).map((x) => x[0]),
    // OPTIONAL
    possibly(sequenceOf([DimensionNextSpace, DimensionNextSpace, ColorValueToken])),
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

export const ParseDeclarationToken = coroutine((run): AstDeclarationNode => {
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
      choice([CalcValueToken, ColorValueToken, DimensionsToken, DeclarationRawValueToken]),
    );
  }

  run(possibly(S.char(';')));

  return {
    type: 'DECLARATION',
    property,
    value,
  };
});

export const DeclarationTokens = C.betweenBrackets(many1(ParseDeclarationToken));
