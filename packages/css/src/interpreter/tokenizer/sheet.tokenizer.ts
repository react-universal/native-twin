import type { CssSheetNode } from '../../types';
import * as parser from '../lib';
import { parseRule } from './rule.tokenizer';
import { parseSelector } from './selector.tokenizer';

export const cssToRawAstSheet = parser.many1(parser.sequence(parseSelector, parseRule)).map(
  (x): CssSheetNode => ({
    type: 'sheet',
    rules: x.flatMap((value) => ({
      type: 'rule',
      selector: value[0],
      declarations: value[1],
    })),
  }),
);
