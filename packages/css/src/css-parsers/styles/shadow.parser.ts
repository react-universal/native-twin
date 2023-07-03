import { parser, string } from '../../lib';
import type { AstShadowNode } from '../../types';
import { CssDimensionsParser } from '../dimensions.parser';
import { CssColorParser } from './color.parser';

const DimensionNextSpace = parser
  .sequenceOf([CssDimensionsParser, string.whitespace])
  .map((x) => x[0]);

// patterns
// Dimension Dimension Color; <offset-x> <offset-y> <color>
// Dimension Dimension Dimension Color; <offset-x> <offset-y> <shadow-radius> <color>
// Dimension Dimension Dimension Dimension Color; <offset-x> <offset-y> <shadow-radius> <spread-radius> <color>
// Dimension Dimension Color; <offset-x> <offset-y> <color>
export const ShadowValueToken = parser
  .many(
    parser.sequenceOf([
      parser.maybe(string.literal(', ')),
      // REQUIRED
      DimensionNextSpace,
      // REQUIRED
      parser.sequenceOf([CssDimensionsParser, string.whitespace]).map((x) => x[0]),
      // OPTIONAL
      parser.maybe(
        parser.sequenceOf([DimensionNextSpace, DimensionNextSpace, CssColorParser]),
      ),
    ]),
  )
  .map(
    (x): AstShadowNode => ({
      type: 'SHADOW',
      value: x.map((y) => ({
        offsetX: y[1],
        offsetY: y[2],
        shadowRadius: y[3]?.[0],
        spreadRadius: y[3]?.[1],
        color: y[3]?.[2],
      })),
    }),
  );
