import { getStylesForProperty } from 'css-to-react-native';
import type { CssInJs } from 'postcss-js';
import type { StyledObject } from '../types';

export function cssPropertiesResolver(input: CssInJs) {
  try {
    const keys = Object.keys(input);
    const styles: StyledObject = {};
    keys.forEach((className) => {
      const style = input[className];
      const transformed = Object.entries(style).reduce((previous, [name, value]) => {
        if (name === 'colorScheme' || name === 'from' || name === 'to' || name === ':root')
          return previous;
        previous = Object.assign(previous, getStylesForProperty(name, String(value)));
        return previous;
      }, {} as StyledObject);
      Object.assign(styles, transformed);
    });
    return styles;
    // return normalizeStyles(transform(input.trim()));
    // return transform(input);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('cssPropertiesResolver_ERROR: ', error);
    return {};
  }
}

export function parseClassNames(classNames = '') {
  const rawClassNames = splitClassNames(classNames);
  const normalClassNames = rawClassNames.filter((item) => !item.includes(':'));
  return normalClassNames;
}

export function parseInteractionClassNames(classNames = '') {
  const rawClassNames = splitClassNames(classNames);
  const interactionClassNames = rawClassNames
    .filter((item) => item.includes(':'))
    .map((item): [string, string] => [item.split(':')[0]!, item.split(':')[1]!])
    .reduce((prev, [selector, className]) => {
      if (selector in prev) {
        prev[selector] = `${prev[selector]} ${className}`;
      } else {
        prev[selector] = className;
      }
      return prev;
    }, {} as { [key: string]: string });
  return interactionClassNames;
}

export function splitClassNames(classNames = '') {
  const rawClassNames = classNames
    ?.replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(
      (className) =>
        className !== '' && className !== 'undefined' && typeof className !== 'undefined',
    );
  return rawClassNames;
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

export function getComponentClassNameSet(
  className: string,
  classPropsTuple: [string, string][],
) {
  const baseClasses = splitClassNames(className);
  if (!classPropsTuple) return baseClasses;

  const fullSet = classPropsTuple.reduce((prev, current) => {
    const classes = splitClassNames(current[1]);
    return prev.concat(classes);
  }, baseClasses);
  return fullSet;
}
