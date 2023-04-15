const InteractionPseudoSelectors = ['hover', 'active', 'focus'] as const;

const GroupInteractionPseudoSelectors = [
  'group-hover',
  'group-focus',
  'group-active',
] as const;

const AppearancePseudoSelectors = ['dark'] as const;

const ChildPseudoSelectors = ['last', 'first', 'even', 'odd'] as const;

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
