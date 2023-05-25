import { createCssRuleNode } from './CssAstNodes';
import type { CssLexerState, RuleNode } from './css.types';

const CssToAST = (css: string, rules: RuleNode[] = []): RuleNode[] => {
  let currentState: CssLexerState = {
    cursor: 0,
    targetString: removeComments(css),
  };
  const isSelector = currentState.targetString[currentState.cursor] === '.';
  if (isSelector) {
    const endOfSelector = currentState.targetString.indexOf('{');
    const selector = currentState.targetString.slice(currentState.cursor, endOfSelector);

    currentState.cursor = endOfSelector;
    const nextChar = currentState.targetString[currentState.cursor];
    if (nextChar === '{') {
      currentState.cursor += 1;
      const endOfDeclarations = currentState.targetString.indexOf('}');
      const ruleBody = currentState.targetString.slice(currentState.cursor, endOfDeclarations);
      currentState.cursor = endOfDeclarations + 1;
      rules.push(createCssRuleNode(selector, ruleBody));
      if (currentState.cursor < currentState.targetString.length) {
        return CssToAST(currentState.targetString.slice(currentState.cursor), rules);
      }
    }
  }

  // console.log('CssToAST -> rules', rules);

  return rules;
};

function removeComments(css: string): string {
  return css.replace(/\/\*[^]*?\*\/|\s\s+|\n/gm, '');
}

export { CssToAST };
