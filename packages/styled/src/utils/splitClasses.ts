import type {
  ValidAppearancePseudoSelector,
  ValidChildPseudoSelector,
  ValidInteractionPseudoSelector,
  ValidPlatformPseudoSelector,
} from '../constants/ValidPseudoElements';

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
