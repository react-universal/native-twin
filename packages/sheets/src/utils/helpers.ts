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
  const declarations: [string, string, string][] = [];
  walk(ast, {
    visit: 'Declaration',
    leave(node) {
      // console.log('NODE: ', node);
      if (this.rule?.prelude?.type === 'Raw') {
        // console.log('RAW: ', this.rule.prelude.value);
        if (!node.property.startsWith('--') && node.value.type === 'Value') {
          let [key, value] = generate(node).split(':');
          // console.log('key, value', key, value);
          if (key && value) {
            declarations.push([this.rule.prelude.value, key, value]);
          }
        }
      }
    },
  });
  return declarations;
  // console.groupEnd();
};
