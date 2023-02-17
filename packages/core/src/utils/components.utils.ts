import type { TPseudoSelectorTypes } from '../types/store.types';

function isValidPseudoSelector(selector: string): selector is TPseudoSelectorTypes {
  return (
    selector === 'hover' ||
    selector === 'active' ||
    selector === 'focus' ||
    selector === 'dark' ||
    selector === 'group-hover'
  );
}

function splitClasses(classNames = '') {
  const rawClassNames = classNames?.replace(/\s+/g, ' ').trim().split(' ');

  return rawClassNames;
}

export function parseClassNames(classNames = '') {
  const rawClassNames = splitClasses(classNames);
  const normalClassNames = rawClassNames.filter((item) => !item.includes(':'));
  const interactionClassNames = rawClassNames
    .filter((item) => item.includes(':'))
    .map((item) => item.split(':'));

  return {
    interactionClassNames,
    normalClassNames,
  };
}

export function parsePseudoElements(classNames: string[][]) {
  const interactions: [TPseudoSelectorTypes, string][] = [];
  for (const current of classNames) {
    if (!isValidPseudoSelector(current[0])) continue;
    const pseudoSelector = current[0];
    const className = current[1];
    interactions.push([pseudoSelector, className]);
  }
  return interactions;
}
