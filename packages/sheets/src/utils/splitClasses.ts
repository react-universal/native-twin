import { Platform } from 'react-native';
import type {
  ValidAppearancePseudoSelector,
  ValidChildPseudoSelector,
  ValidInteractionPseudoSelector,
  ValidPlatformPseudoSelector,
} from '../constants';
import { EMPTY_ARRAY } from '../constants/empties';

export function classNamesToArray(classNames?: string): readonly string[] {
  const rawClassNames = classNames
    ?.replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((className) => {
      if (className.includes('web:') && Platform.OS !== 'web') {
        return false;
      }
      if (className.includes('native:') && Platform.OS === 'web') {
        return false;
      }
      if (className.includes('android:') && Platform.OS !== 'android') {
        return false;
      }
      if (className.includes('ios:') && Platform.OS !== 'ios') {
        return false;
      }
      return className !== '' && className !== 'undefined' && typeof className !== 'undefined';
    });
  return Object.freeze(rawClassNames ?? EMPTY_ARRAY);
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
