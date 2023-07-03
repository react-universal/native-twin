import { composed, number, parser, string } from '../../lib';
import type { AstRawValueNode } from '../../types';

const rgbaUnit = string.literal('rgba');
const hslUnit = string.literal('hsl');

export const DeclarationColor = parser.choice([rgbaUnit, hslUnit]);

export const CssColorParser = parser
  .sequenceOf([
    DeclarationColor,
    composed.betweenParens(
      parser.many1(parser.choice([number.alphanumeric, string.char('.'), string.char(',')])),
    ),
  ])
  .map(
    (x): AstRawValueNode => ({
      type: 'RAW',
      value: x[0] + `(${x[1].join('')})`,
    }),
  );
