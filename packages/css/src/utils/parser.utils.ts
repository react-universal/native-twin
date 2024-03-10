import { TokenIdentity } from '../types/parser.types';

export const tokenIdentity: TokenIdentity = (type) => (value) => ({
  type,
  value,
});
