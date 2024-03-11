import type { StyleProp } from 'react-native';
import { Falsey, StringLike } from '@universal-labs/helpers';
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

export type CSSValue =
  | string
  | number
  | bigint
  | Falsey
  | StringLike
  | StyleProp<any>
  | CSSValue[];

export type CssFeature =
  | 'edges'
  | 'corners'
  | 'colors'
  | 'default'
  | 'gap'
  | 'transform-2d'
  | 'transform-3d';

export type SelectorGroup = 'base' | 'group' | 'pointer' | 'first' | 'last' | 'odd' | 'even';

export type CSSUnits =
  | 'px'
  | '%'
  | 'em'
  | 'rem'
  | 'deg'
  | 'vh'
  | 'vw'
  | 'rad'
  | 'turn'
  | 'pc'
  | 'cn'
  | 'ex'
  | 'in'
  | 'pt'
  | 'cm'
  | 'mm'
  | 'Q';

export interface ParserToken<T, U> {
  type: T;
  value: U;
}
export type ParserTokenIdentity = <T extends string>(
  type: T,
) => <U>(value: U) => ParserToken<T, U>;
