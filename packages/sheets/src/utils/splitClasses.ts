import type {
  ValidAppearancePseudoSelector,
  ValidChildPseudoSelector,
  ValidInteractionPseudoSelector,
  ValidPlatformPseudoSelector,
} from '../constants';
import {
  InteractionPseudoSelectors,
  PlatformPseudoSelectors,
  AppearancePseudoSelectors,
  ChildPseudoSelectors,
  GroupInteractionPseudoSelectors,
} from '../constants';
import { EMPTY_ARRAY } from '../constants/empties';

export function classNamesToArray(classNames?: string): readonly string[] {
  const rawClassNames = classNames
    ?.replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(
      (className) =>
        className !== '' && className !== 'undefined' && typeof className !== 'undefined',
    );
  return Object.freeze(rawClassNames ?? EMPTY_ARRAY);
}

export function extractClassNameData(className: string) {
  if (className.includes(':')) {
    const splittedClass = className.split(':');
    const data = {
      className: splittedClass[1] ?? '',
      pseudoSelector: splittedClass[0] ?? '',
    };
    return data;
  }
  return {
    className,
    pseudoSelector: null,
  };
}

export function getPseudoSelectorClassNames(
  classNamesArray: readonly string[],
  interaction:
    | ValidInteractionPseudoSelector
    | ValidAppearancePseudoSelector
    | ValidChildPseudoSelector
    | ValidPlatformPseudoSelector,
) {
  return classNamesArray.filter((item) => item.includes(`${interaction}:`));
}

export function extractClassesGroups(originalClasses: readonly string[]) {
  const pointerEventsClasses: string[] = [];
  const baseClasses: string[] = [];
  const platformClasses: string[] = [];
  const childClasses: string[] = [];
  const appearanceClasses: string[] = [];
  const groupEventsClasses: string[] = [];
  for (const currentClass of originalClasses) {
    const data = extractClassNameData(currentClass);
    if (data.pseudoSelector) {
      if (InteractionPseudoSelectors.some((item) => item === data.pseudoSelector)) {
        pointerEventsClasses.push(currentClass);
        continue;
      }
      if (PlatformPseudoSelectors.some((item) => item === data.pseudoSelector)) {
        platformClasses.push(currentClass);
        continue;
      }
      if (ChildPseudoSelectors.some((item) => item === data.pseudoSelector)) {
        childClasses.push(currentClass);
        continue;
      }
      if (AppearancePseudoSelectors.some((item) => item === data.pseudoSelector)) {
        appearanceClasses.push(currentClass);
        continue;
      }
      if (GroupInteractionPseudoSelectors.some((item) => item === data.pseudoSelector)) {
        groupEventsClasses.push(currentClass);
        continue;
      }
    }
    baseClasses.push(currentClass);
  }
  return {
    baseClasses,
    platformClasses,
    childClasses,
    appearanceClasses,
    groupEventsClasses,
    originalClasses,
    pointerEventsClasses,
  };
}
