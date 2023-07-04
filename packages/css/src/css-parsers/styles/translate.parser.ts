import { evaluateDimensionsNode } from '../../evaluators/dimensions.evaluator';
import { parser, string } from '../../lib';
import type { AnyStyle } from '../../types';
import { CssDimensionsParser } from '../dimensions.parser';

export const TranslateValueToken = parser
  .sequenceOf([
    string.literal('translate'),
    string.char('('),
    CssDimensionsParser,
    parser.maybe(string.literal(', ')),
    parser.maybe(CssDimensionsParser),
    string.char(')'),
  ])
  .mapFromData((x) => {
    const styles: AnyStyle['transform'] = [
      { translateX: evaluateDimensionsNode(x.result[2], x.data) },
    ];
    if (x.result[4]) {
      styles.push({
        translateY: evaluateDimensionsNode(x.result[4], x.data),
      });
    }
    return styles;
  });
