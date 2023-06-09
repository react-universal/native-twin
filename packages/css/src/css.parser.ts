import { parseCssRule, parseCssSelector } from './css.combinators';
import { parseMany, parseSequenceOf } from './parsers/common';
import type { CssRuleNode, CssSheetNode } from './types';

export const createCssParser = (_config: {
  rem: number;
  deviceWidth: number;
  deviceHeight: number;
}) => {
  const tokenizeCss = (css: string[]) => {
    const tokens = parseMany(
      parseSequenceOf([parseCssSelector, parseCssRule]).map((x): CssRuleNode => {
        return {
          type: 'rule',
          selector: x[0],
          declarations: x[1],
        };
      }),
    )
      .map(
        (x): CssSheetNode => ({
          type: 'sheet',
          rules: x,
        }),
      )
      .run(css.join(''));
    return tokens;
  };

  return {
    tokenizeCss,
  };
};
