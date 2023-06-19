import * as parser from './lib';
import { cssToRawAstSheet } from './tokenizer/sheet.tokenizer';

export const cssToAst = (input: string) => {
  const ast = parser.apply(cssToRawAstSheet, input);
  let tree = ast[0];
  if (!tree) throw new Error('Empty sheet');
  return tree[0];
};
