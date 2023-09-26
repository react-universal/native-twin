const InteractionPseudoSelectors = ['hover', 'active', 'focus'] as const;

const AppearancePseudoSelectors = ['dark', 'light'] as const;

const ChildPseudoSelectors = ['last-child', 'first-child', 'even', 'odd'] as const;

const GroupInteractionPseudoSelectors = [
  'group',
  'group-hover',
  'group-active',
  'group-focus',
] as const;

const PlatformPseudoSelectors = ['native', 'ios', 'android', 'web'] as const;

export {
  InteractionPseudoSelectors,
  AppearancePseudoSelectors,
  PlatformPseudoSelectors,
  ChildPseudoSelectors,
  GroupInteractionPseudoSelectors,
};

export type ValidInteractionPseudoSelector = (typeof InteractionPseudoSelectors)[number];
export type ValidAppearancePseudoSelector = (typeof AppearancePseudoSelectors)[number];
export type ValidChildPseudoSelector = (typeof ChildPseudoSelectors)[number];
export type ValidPlatformPseudoSelector = (typeof PlatformPseudoSelectors)[number];
export type ValidGroupPseudoSelector = (typeof GroupInteractionPseudoSelectors)[number];
export type ValidPlatformInteractionPseudoSelector =
  | `${
      | ValidInteractionPseudoSelector
      | ValidGroupPseudoSelector}:${ValidPlatformPseudoSelector}`;
