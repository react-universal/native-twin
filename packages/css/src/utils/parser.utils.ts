import { TokenIdentity } from '../types/parser.types';

export const tokenIdentity: TokenIdentity = (type) => (value) => ({
  type,
  value,
});

export const asNumber = (x: string) => Number(x);
export const asString = <T>(x: T) => String(x);
