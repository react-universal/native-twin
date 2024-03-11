import {
  AppearancePseudoSelectors,
  ChildPseudoSelectors,
  GroupInteractionPseudoSelectors,
  InteractionPseudoSelectors,
  PlatformPseudoSelectors,
  simplePseudoMap,
} from './css.constants';

export type ValidInteractionPseudoSelector = (typeof InteractionPseudoSelectors)[number];
export type ValidAppearancePseudoSelector = (typeof AppearancePseudoSelectors)[number];
export type ValidChildPseudoSelector = (typeof ChildPseudoSelectors)[number];
export type ValidPlatformPseudoSelector = (typeof PlatformPseudoSelectors)[number];
export type ValidGroupPseudoSelector = (typeof GroupInteractionPseudoSelectors)[number];
export type SimplePseudos = keyof typeof simplePseudoMap;
export type ValidPlatformInteractionPseudoSelector = `${
  | ValidInteractionPseudoSelector
  | ValidGroupPseudoSelector}:${ValidPlatformPseudoSelector}`;
