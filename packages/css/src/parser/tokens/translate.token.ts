import * as parser from '../Parser';
import { DimensionsToken } from './dimensions.token';

export const TranslateValueToken = parser
  .literal('translate')
  .chain((_) =>
    parser.betweenParens(
      parser.commaSeparated(
        parser.choice([
          DimensionsToken,
          parser.validNumber.map((x) => ({
            type: 'dimensions',
            unit: 'none',
            value: parseFloat(x),
          })),
        ]),
      ),
    ),
  )
  .map((result) => ({
    type: 'transform',
    dimension: '2d',
    x: result[0]!,
    y: result[1],
    z: result[2],
  }));
