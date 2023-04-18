import { Platform } from 'react-native';
import type {
  ValidAppearancePseudoSelector,
  ValidChildPseudoSelector,
  ValidInteractionPseudoSelector,
  ValidPlatformPseudoSelector,
} from '../constants';

export function classNamesToArray(classNames?: string): string[] {
  const rawClassNames =
    classNames
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
        return (
          className !== '' && className !== 'undefined' && typeof className !== 'undefined'
        );
      }) ?? [];
  return rawClassNames;
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
