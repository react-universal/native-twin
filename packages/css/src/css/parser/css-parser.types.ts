import type { Platform } from 'react-native';
import { AnyStyle, FinalSheet } from '../../react-native/rn.types';
import {
  SelectorGroup,
  ValidAppearancePseudoSelector,
  ValidCssChildPseudoSelector,
  ValidGroupPseudoSelector,
  ValidInteractionPseudoSelector,
  ValidPlatformPseudoSelector,
} from '../css.types';

export interface CssParserData {
  context: {
    rem: number;
    deviceWidth: number;
    deviceHeight: number;
    platform: Platform['OS'];
  };
  styles: FinalSheet;
  cache: {
    get: (selector: string) => AnyStyle | null;
    set: (selector: string, style: AnyStyle) => void;
  };
}

export interface SelectorPayload {
  group: SelectorGroup;
  selectorName: string;
  pseudoSelectors: (
    | ValidInteractionPseudoSelector
    | ValidCssChildPseudoSelector
    | ValidPlatformPseudoSelector
    | ValidGroupPseudoSelector
    | ValidAppearancePseudoSelector
  )[];
}
