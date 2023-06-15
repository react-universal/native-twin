import util from 'util';
import { CssResult, evaluateSheet, SheetNode } from './evaluate';
import { parseRule } from './lexer/rule.tokenizer';
import { parseSelector } from './lexer/selector.tokenizer';
import * as parser from './lib';

const cssToAst: parser.Parser<SheetNode> = parser
  .many1(parser.sequence(parseSelector, parseRule))
  .bind((x) =>
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

export const parseCss = (input: string) => {
  const ast = cssToAst(input);
  if (!ast[0]) throw new Error('Parser fail to create AST.' + input);
  const tree = evaluateSheet(ast[0][0]);

  const payload = tree.reduce(
    (prev, current) => {
      prev.selectors.push(current.selector);
      current.declaration.value.reduce((prevD, declaration) => {
        return Object.assign(prevD, {
          [declaration.property]: declaration.value,
        });
      }, prev.rules);
      return prev;
    },
    {
      selectors: [] as string[],
      rules: {} as Record<
        CssResult['declaration']['value'][number]['property'],
        CssResult['declaration']['value'][number]['value']
      >,
    },
  );

  return payload;
};

util.inspect(
  parseCss(
    '.text-2xl{font-size:24px;line-height:32px}.leading{line-height:10px}.translate-x{translateX: (10px)}',
  ),
  false,
  null,
  true,
);
// evaluateSheet(parsed); // ?
