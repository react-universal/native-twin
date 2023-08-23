import * as P from '@universal-labs/css/parser';

const rawIdent = P.letters.map((x) => ({
  type: 'RAW',
  value: x,
}));
