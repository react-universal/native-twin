import * as C from '../Common';
import * as P from '../Parser';
import * as S from '../Strings';

const DimensionsToken = P.sequenceOf([S.float, P.possibly(C.DeclarationUnit)]).map((x) =>
  C.mapToTokenNode('DIMENSIONS', {
    value: x[0],
    unit: x[1] ?? 'none',
  }),
);

const DimensionsSeparatedBySpace = C.separatedBySpace(DimensionsToken);

const DeclarationPropertyToken = P.sequenceOf([S.ident, S.char(':')]).map((x) =>
  C.mapToTokenNode('PROPERTY', { value: x[0] }),
);

const DeclarationValueToken = P.choice([DimensionsSeparatedBySpace, DimensionsToken]).map(
  (x) => C.mapToTokenNode('VALUE', x),
);

const ParseDeclarations = P.coroutine((run) => {
  const property = run(DeclarationPropertyToken);
  if (property.value === 'flex') {
    const value = run(DimensionsSeparatedBySpace);
    return C.mapToTokenNode('DECLARATION', {
      property,
      value,
    });
  }
  const value = run(DeclarationValueToken);
  return C.mapToTokenNode('DECLARATION', {
    property,
    value,
  });
});

export const DeclarationToken = C.betweenBrackets(ParseDeclarations);
