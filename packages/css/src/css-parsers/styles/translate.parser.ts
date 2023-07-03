import { parser, string } from '../../lib';
import type { AstTransformValueNode } from '../../types';
import { translateKeyword } from '../common.parsers';
import { CssDimensionsParser } from '../dimensions.parser';

export const TranslateValueToken = parser
  .sequenceOf([
    translateKeyword,
    string.char('('),
    CssDimensionsParser,
    parser.maybe(string.literal(', ')),
    CssDimensionsParser,
    string.char(')'),
  ])
  .map((x): AstTransformValueNode => {
    return {
      dimension: '2d',
      type: 'TRANSFORM',
      x: x[2],
      ...(x[3] ? { y: x[4] } : {}),
    };
  });
