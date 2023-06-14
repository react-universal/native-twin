import { parseRule } from './lexer/rule.tokenizer';
import { parseSelector } from './lexer/selector.tokenizer';
import * as parser from './lib';

const cssToAst = parser.many1(parser.sequence(parseSelector, parseRule)).bind((x) =>
  parser.unit(
    parser.mapResultToNode(
      'sheet',
      x.flatMap((value) => {
        return {
          selector: value[0],
          rule: value[1],
        };
      }),
    ),
  ),
);

const createParser = () => {
  const parseCss = (input: string) => {
    const ast = cssToAst(input);
    if (!ast[0]) throw new Error('Parser fail to create AST.');
    return ast[0];
  };

  return (css: string) => {
    const ast = parseCss(css)[0];
    // if (!ast) throw new Error('Parser fail to create AST.');
    return ast;
  };
};

export const parseCss = createParser();
