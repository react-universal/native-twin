export type TActionTypes = 'hover' | 'active' | 'focus';

export type IComponentInteractions = Record<
  TActionTypes,
  {
    active: boolean;
    styles: Record<string, any>;
    classNames: string[];
  }
>;

function isValidPseudoSelector(selector: string): selector is TActionTypes {
  return selector === 'hover' || selector === 'active' || selector === 'focus';
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
  let interactions: IComponentInteractions = {
    hover: {
      active: false,
      styles: {},
      classNames: [],
    },
    active: {
      active: false,
      styles: {},
      classNames: [],
    },
    focus: {
      active: false,
      styles: {},
      classNames: [],
    },
  };
  for (const current of classNames) {
    if (current[0] in interactions) {
      if (!isValidPseudoSelector(current[0])) continue;
      const pseudoSelector = current[0];
      const className = current[1];
      interactions[pseudoSelector].classNames.push(className);
    }
  }
  return interactions;
}
