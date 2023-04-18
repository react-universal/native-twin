import { getStylesForProperty } from 'css-to-react-native';
import type { CssInJs } from 'postcss-js';
import type { StyledObject } from '../types';

export function cssPropertiesResolver(input: CssInJs) {
  try {
    const styles: StyledObject = {};
    const transformed = Object.entries(input).reduce((previous, [name, value]) => {
      if (name === 'colorScheme' || name === 'from' || name === 'to' || name === ':root')
        return previous;
      previous = Object.assign(previous, getStylesForProperty(name, String(value)));
      return previous;
    }, {} as StyledObject);
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
