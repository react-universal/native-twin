import { number, parser } from '../lib';
import type { AstDimensionsNode } from '../types';
import { DeclarationUnit } from './common.parsers';

export const CssUnitlessDimensionParser = number.float.map(
  (x): AstDimensionsNode => ({
    type: 'DIMENSIONS',
    value: parseFloat(x),
    units: 'none',
  }),
);

export const CssUnitDimensionsParser = parser.sequenceOf([number.float, DeclarationUnit]).map(
  (x): AstDimensionsNode => ({
    type: 'DIMENSIONS',
    value: parseFloat(x[0]),
    units: x[1] ?? 'none',
  }),
);

export const CssDimensionsParser = parser.choice([
  CssUnitDimensionsParser,
  CssUnitlessDimensionParser,
]);
