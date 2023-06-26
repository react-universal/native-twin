import type {
  AstDeclarationNode,
  AstDimensionsNode,
  AstFlexNode,
  AstRawValueNode,
} from '../../types';
import * as C from '../Common';
import * as P from '../Parser';
import * as S from '../Strings';

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
  P.many1(P.choice([S.char('('), S.alphanumeric, S.char(','), S.char(')')])),
]).map(
  (x): AstRawValueNode => ({
    type: 'RAW',
    value: x[0] + x[1].join(''),
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

const DeclarationPropertyToken = P.sequenceOf([S.ident, S.char(':')]).map((x) => x[0]);

const DeclarationRawValueToken = P.sequenceOf([
  P.choice([P.everyCharUntil(';'), P.everyCharUntil('}')]),
  P.possibly(S.char(';')),
]).map(
  (x): AstRawValueNode => ({
    type: 'RAW',
    value: x[0],
  }),
);

const ParseDeclarationToken = P.sequenceOf([
  DeclarationPropertyToken,
  P.choice([ColorValueToken, DimensionsToken, FlexToken, DeclarationRawValueToken]),
  P.possibly(S.char(';')),
]).map(
  (x): AstDeclarationNode => ({
    type: 'DECLARATION',
    property: x[0],
    value: x[1],
  }),
);

export const DeclarationToken = C.betweenBrackets(P.many(ParseDeclarationToken));
