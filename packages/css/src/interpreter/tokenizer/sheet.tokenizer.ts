import type { CssAstNode } from '../../types';
import * as parser from '../lib';
import { CssAstOf, CssNodeMonad } from '../nodes.monad';
import { parseRule } from './rule.tokenizer';
import { parseSelector } from './selector.tokenizer';

export const cssToRawAstSheet: parser.Parser<CssNodeMonad<CssAstNode>> = parser
  .many1(parser.sequence(parseSelector, parseRule))
  .map((x) =>
    CssAstOf({
      type: 'raw-sheet',
      rules: x.flatMap((value) => ({
        type: 'raw-rule',
        selector: value[0],
        value: value[1],
      })),
    }),
  );
