import type { TwindRule } from '@universal-labs/tailwind';

export default function transformCssVariables(rule: TwindRule) {
  if (rule.d && rule.d?.includes('var(--')) {
    const variable = rule.d.split(';');
    let variableRule = variable[0];
    let declaration = `${variable[1]};`;
    if (variableRule && declaration) {
      const variable = variableRule.split(':');
      const variableName = variable[0];
      const variableValue = variable[1];
      if (variableValue && variableName) {
        declaration = declaration.replace(/(var\((--[\w-]+)\))/g, (match, p1, p2) => {
          if (p2 === variableName) {
            return variableValue;
          }
          return match;
        });
        rule.d = `${declaration}`;
      }
    }
  }
  return rule;
}
