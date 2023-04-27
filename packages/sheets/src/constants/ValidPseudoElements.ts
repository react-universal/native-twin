export type ValidInteractionPseudoSelector = 'hover' | 'active' | 'focus';
export type ValidAppearancePseudoSelector = 'dark';
export type ValidChildPseudoSelector = 'first' | 'last' | 'even' | 'odd';
export type ValidGroupPseudoSelector = 'group-hover' | 'group-focus' | 'group-active';

// For Platforms
export type ValidPlatformPseudoSelector = 'native' | 'ios' | 'android' | 'web';
export type ValidPlatformInteractionPseudoSelector =
  | `${
      | ValidInteractionPseudoSelector
      | ValidGroupPseudoSelector}:${ValidPlatformPseudoSelector}`;
