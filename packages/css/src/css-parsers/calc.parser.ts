import { resolveCssCalc } from '../helpers';
import { composed, parser, string } from '../lib';
import type { AstDimensionsNode } from '../types';
import { calcKeyword } from './common.parsers';
import { CssDimensionsParser } from './dimensions.parser';

export const CssCalcParser = parser
  .sequenceOf([
    calcKeyword,
    string.char('('),
    CssDimensionsParser,
    parser.between(string.whitespace)(string.whitespace)(composed.parseMathOperatorSymbol),
    CssDimensionsParser,
    string.char(')'),
  ])
  .map((x): AstDimensionsNode => {
    return resolveCssCalc(x[2], x[3], x[4]);
  });
