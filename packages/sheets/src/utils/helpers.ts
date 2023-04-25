import { getStylesForProperty } from 'css-to-react-native';
import { CssNode, generate, walk } from 'css-tree';
import type { AnyStyle } from '../types';

export function cssPropertiesResolver(input: any) {
  try {
    const styles: AnyStyle = {};
    const transformed = Object.entries(input).reduce((previous, [name, value]) => {
      if (name === 'colorScheme' || name === 'from' || name === 'to' || name === ':root')
        return previous;
      previous = Object.assign(previous, getStylesForProperty(name, String(value)));
      return previous;
    }, {} as AnyStyle);
    Object.assign(styles, transformed);
    return styles;
    // return normalizeStyles(transform(input.trim()));
    // return transform(input);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('cssPropertiesResolver_ERROR: ', error);
    return {};
  }
}

export function getClassesForSelectors<T>(classNames: string[][], selectors: readonly T[]) {
  const classes: [T, string][] = [];
  for (const current of classNames) {
    if (!current[0] || !current[1]) continue;
    const pseudoSelector = current[0];
    const className = current[1];
    if (selectors.includes(pseudoSelector as T)) {
      classes.push([pseudoSelector as T, className]);
    }
  }
  return classes;
}

export const extractCSSStyles = (ast: CssNode) => {
  const variables: [string, string, string][] = [];
  const declarations: [string, string, string][] = [];
  walk(ast, {
    visit: 'Declaration',
    leave(node) {
      // console.log('NODE: ', node);
      if (this.rule?.prelude?.type === 'Raw') {
        // console.log('RAW: ', this.rule.prelude.value);
        if (node.property.startsWith('--')) {
          variables.push([
            this.rule.prelude.value,
            node.property,
            node.value.type === 'Raw' ? node.value.value : '',
          ]);
        }
        if (node.value.type === 'Value') {
          let [key, value] = generate(node).split(':');
          if (key && value) {
            value = parseVariables(value, variables);
            value = parseCalc(value);
            declarations.push([this.rule.prelude.value, key, value]);
          }
        }
      }
    },
  });
  return { variables, declarations };
  // console.groupEnd();
};

const parseVariables = (value: string, variables: [string, string, string][]) => {
  return value.replace(/(var\((--[\w-]+)\))/g, (match, p1, p2) => {
    const variable = variables.find((item) => item[1] === p2);
    if (variable) {
      const [, , variableValue] = variable;
      return variableValue;
    }
    return match;
  });
};
// regex for extract values from calc(20px * 1)

const parseCalc = (value: string) => {
  return value.replace(/calc\(([\w-]+)\s*([*/+\\-])\s*([\w-]+)\)/g, (match, p1, p2, p3) => {
    const valueLeft = parseInt(p1);
    const operator = p2;
    const valueRight = parseInt(p3);
    if (valueLeft && operator && valueRight) {
      return `${valueLeft * valueRight}px`;
    }
    return match;
  });
};
