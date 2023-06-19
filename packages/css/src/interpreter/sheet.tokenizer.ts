import { CssAstOf } from '../parser/CssParser';
import { evaluateRawTree } from './evaluate';
import * as parser from './lib';
import { cssToRawAstSheet } from './tokenizer/sheet.tokenizer';

export const cssToAst = (input: string) => {
  const ast = parser.apply(cssToRawAstSheet, input);
  let tree = ast[0]
    ? ast[0][0]
    : CssAstOf({
        type: 'raw-sheet',
        rules: [],
      });
  return evaluateRawTree(tree);
};
