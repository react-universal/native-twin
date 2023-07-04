import type { ShadowStyleIOS } from 'react-native';
import { evaluateDimensionsNode } from '../../evaluators/dimensions.evaluator';
import { parser, string } from '../../lib';
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
  .mapFromData((x): ShadowStyleIOS => {
    const shadow = x.result[0]!;
    return {
      shadowOffset: {
        width: evaluateDimensionsNode(shadow[1], x.data),
        height: evaluateDimensionsNode(shadow[2], x.data),
      },
      shadowRadius: shadow[3]?.[0] && evaluateDimensionsNode(shadow[3]![0], x.data),
      shadowOpacity: shadow[3]?.[1] && evaluateDimensionsNode(shadow[3]![1], x.data),
      shadowColor: shadow[3]?.[2]?.value,
    };
  });
