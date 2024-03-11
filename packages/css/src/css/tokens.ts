import { tokenIdentity } from '../utils/parser.utils';

export const numericToken = tokenIdentity('INTEGER');
export const floatToken = tokenIdentity('FLOAT');
export const cssUnitToken = tokenIdentity('UNIT');
