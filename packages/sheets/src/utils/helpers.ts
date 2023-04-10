import { getStylesForProperty } from 'css-to-react-native';
import type { CssInJs } from 'postcss-js';
import type { IStyleType } from '../types';

export function cssPropertiesResolver(input: CssInJs) {
  try {
    const keys = Object.keys(input);
    const styles: IStyleType = {};
    keys.forEach((className) => {
      const style = input[className];
      const transformed = Object.entries(style).reduce((previous, [name, value]) => {
        if (name === 'colorScheme' || name === 'from' || name === 'to' || name === ':root')
          return previous;
        previous = Object.assign(previous, getStylesForProperty(name, String(value)));
        return previous;
      }, {} as IStyleType);
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
  const interactionClassNames = rawClassNames
    .filter((item) => item.includes(':'))
    .map((item) => item.split(':'));
  return {
    interactionClassNames,
    normalClassNames,
  };
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
