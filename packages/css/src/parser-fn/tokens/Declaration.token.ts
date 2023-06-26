import * as C from '../Common';
import * as P from '../Parser';
import * as S from '../Strings';
import type {
  AstDeclarationNode,
  AstDimensionsNode,
  AstFlexNode,
  AstRawValueNode,
} from '../types';

const DimensionsToken = P.sequenceOf([S.float, P.possibly(C.DeclarationUnit)]).map(
  (x): AstDimensionsNode => ({
    type: 'DIMENSIONS',
    value: parseFloat(x[0]),
    units: x[1] ?? 'none',
  }),
);

const FlexToken = C.separatedBySpace(DimensionsToken).map((x): AstFlexNode => {
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
  P.choice([FlexToken, DimensionsToken, DeclarationRawValueToken]),
  P.possibly(S.char(';')),
]).map(
  (x): AstDeclarationNode => ({
    type: 'DECLARATION',
    property: x[0],
    value: x[1],
  }),
);

export const DeclarationToken = C.betweenBrackets(P.many1(ParseDeclarationToken));
