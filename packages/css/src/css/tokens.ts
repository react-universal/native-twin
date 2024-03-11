import { ParserTokenIdentity } from './css.types';

export const tokenIdentity: ParserTokenIdentity = (type) => (value) => ({
  type,
  value,
});

export const numericToken = tokenIdentity('INTEGER');
export const floatToken = tokenIdentity('FLOAT');
export const cssUnitToken = tokenIdentity('UNIT');
