import { CssRuleAST, CssStylesheetAST, parse } from '@adobe/css-tools';

export function extractDeclarationsFromCSS(css: string) {
  const ast = parse(css);
  const declarations = rulesWalk(ast.stylesheet.rules);
  return declarations;
}

function walkDeclarations(
  declarations: CssRuleAST['declarations'],
  transformed: [string, string][] = [],
): [string, string][] {
  const currentDeclaration = declarations.shift();
  if (!currentDeclaration) return transformed;
  if (currentDeclaration.type !== 'declaration')
    return walkDeclarations(declarations, transformed);
  transformed.push([currentDeclaration.property!, currentDeclaration.value!]);
  return walkDeclarations(declarations, transformed);
}

// function walkSelectors(
//   ruleSelectors: CssRuleAST['selectors'],
//   transformed: string = ``,
// ): string {
//   const currentSelector = ruleSelectors.shift();
//   if (!currentSelector) return transformed;
//   transformed = `${transformed}${currentSelector.trim()}`;
//   return walkSelectors(ruleSelectors, normalizeClassNameString(transformed).trim());
// }

function rulesWalk(
  rules: CssStylesheetAST['stylesheet']['rules'],
  declarations: [string, string][] = [],
): [string, string][] {
  const currentRule = rules.shift();
  if (!currentRule) return declarations;
  // This will add a notation like O(n^2) to the algorithm
  // TODO: Optimize this; Maybe use a stack to keep track of the current rule
  if (currentRule.type === 'media' && currentRule.rules) {
    return rulesWalk(currentRule.rules, declarations);
  }

  if (currentRule.type !== 'rule') return rulesWalk(rules, declarations);

  if (!currentRule.declarations) return rulesWalk(rules, declarations);

  declarations.push(...walkDeclarations(currentRule.declarations));
  return rulesWalk(rules, declarations);
}

export function isPlatformSelector(selector: string) {
  return selector.includes('web') || selector.includes('android') || selector.includes('ios');
}

export function isGroupSelector(selector: string) {
  return (
    selector.includes('group-hover') ||
    selector.includes('group-focus') ||
    selector.includes('group-active')
  );
}

export function isEvenSelector(selector: string) {
  return selector.includes('even');
}

export function isOddSelector(selector: string) {
  return selector.includes('odd');
}

export function isFirstSelector(selector: string) {
  return selector.includes('first');
}

export function isLastSelector(selector: string) {
  return selector.includes('last');
}

export function isPointerSelector(selector: string) {
  return (
    selector.includes('hover') ||
    selector.includes('focus') ||
    selector.includes('active') ||
    selector.includes('disabled')
  );
}
