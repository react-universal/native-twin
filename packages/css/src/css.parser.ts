import * as parser from './interpreter/lib';
import { CssAstOf } from './interpreter/nodes.monad';
import { parseCssToRuleNodes } from './interpreter/tokenizer/sheet.tokenizer';
import type { CssRuleNode, SelectorGroup } from './types';

const evaluateTree =
  (tree: CssRuleNode[]) =>
  (groups: SelectorGroup[] = ['base']) => {
    const declarations = tree
      .filter((x) => groups.includes(x.group))
      .flatMap((x) => x.declarations.map((x) => CssAstOf(x)));
    return declarations;
  };

export const parseCssString = (input: string) => {
  const ast = parser.apply(parseCssToRuleNodes, input);
  return evaluateTree(ast.at(0)?.[0] ?? []);
};
