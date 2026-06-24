import type { Falsey, StringLike } from '@native-twin/helpers';
import type { StyleProp } from 'react-native';
import type {
  AppearancePseudoSelectors,
  ChildPseudoSelectors,
  CssChildPseudoSelectors,
  GroupInteractionPseudoSelectors,
  InteractionPseudoSelectors,
  PlatformPseudoSelectors,
  simplePseudoMap,
} from './css.constants';

export type ValidInteractionPseudoSelector = (typeof InteractionPseudoSelectors)[number];
export type ValidAppearancePseudoSelector = (typeof AppearancePseudoSelectors)[number];
export type ValidChildPseudoSelector = (typeof ChildPseudoSelectors)[number];
export type ValidPlatformPseudoSelector = (typeof PlatformPseudoSelectors)[number];
export type ValidCssChildPseudoSelector = (typeof CssChildPseudoSelectors)[number];
export type ValidGroupPseudoSelector = (typeof GroupInteractionPseudoSelectors)[number];
export type SimplePseudos = keyof typeof simplePseudoMap;
export type ValidPlatformInteractionPseudoSelector = `${
  | ValidInteractionPseudoSelector
  | ValidGroupPseudoSelector}:${ValidPlatformPseudoSelector}`;

export type CSSValue = string | number | bigint | Falsey | StringLike | StyleProp<any> | CSSValue[];

export type CssFeature =
  | 'edges'
  | 'corners'
  | 'colors'
  | 'default'
  | 'gap'
  | 'transform-2d'
  | 'transform-3d';

export type SelectorGroup =
  | 'base'
  | 'group'
  | 'pointer'
  | 'first'
  | 'last'
  | 'odd'
  | 'even'
  | 'dark';

export type CSSLengthUnit = {
  [U in CSSUnit]: number;
}[CSSUnit];

export type CSSUnits = {
  [U in CSSUnit]: number;
}[CSSUnit];

export type CSSUnitWithDefaultValue =
  | 'rem'
  | 'em'
  | 'cm'
  | 'mm'
  | 'in'
  | 'pt'
  | 'pc'
  | 'px'
  | 'vmin'
  | 'vmax'
  | 'vw'
  | 'vh';

export type CSSUnit =
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
  | 'Q'
  | 'vmin'
  | 'vmax';

export interface ParserToken<T, U> {
  type: T;
  value: U;
}
export type ParserTokenIdentity = <T extends string>(type: T) => <U>(value: U) => ParserToken<T, U>;
