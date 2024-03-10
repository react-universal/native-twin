import * as P from '@universal-labs/arc-parser';
import { floatToken, numericToken } from './tokens';

export const parseIntegerToken = P.digits.map(numericToken);
export const parseFloatToken = P.float.map(floatToken);
