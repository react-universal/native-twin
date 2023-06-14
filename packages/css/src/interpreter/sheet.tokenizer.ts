import { pipe } from '../pipe.composer';
import { parseRule } from './lexer/rule.tokenizer';
import { parseSelector } from './lexer/selector.tokenizer';
import * as parser from './lib';

interface SelectorNode extends parser.CssAstNode<'selector', string> {}
interface RuleNode extends parser.CssAstNode<'rule', string> {}

interface SheetNode extends parser.CssAstNode<'sheet'> {
  readonly value: {
    readonly selector: SelectorNode;
    readonly rule: RuleNode;
  }[];
}

type AnyCss = SelectorNode | RuleNode | SheetNode;

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
  return sheetInterpreter(ast[0][0]);
};

const parseDeclaration: parser.Parser<string> = parser.makeParser((p) => {
  const indexOfSeparator = p.indexOf(':');
  if (indexOfSeparator < 0) return parser.absurd();
  const property = p.slice(0, indexOfSeparator);
  return [[property, p.slice(indexOfSeparator + 1)]];
});

const evaluateRuleNode = (node: RuleNode) => {
  const value = parseDeclaration(node.value);
  return value;
};

const sheetInterpreter = (node: AnyCss): any => {
  switch (node.type) {
    case 'rule':
      return evaluateRuleNode(node);
    case 'selector':
      return node.value;
    case 'sheet':
      return node.value.map((a) => ({
        selector: sheetInterpreter(a.selector),
        styles: sheetInterpreter(a.rule),
      }));
    default:
      return node;
  }
};

export const evaluateSheet = (sheet: SheetNode) => {
  const result = pipe(sheet, sheetInterpreter);
  return result;
};

// const parsed = parseCss('.text-2xl{font-size:24px;line-height:32px}');
// evaluateSheet(parsed); // ?
