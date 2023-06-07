import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';

/*
  CSS ABSOLUTE UNITS
  https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units
  mm: 3.78px
  cm: 37.8px
  in: 96px
  pt: 1.33px
  pc: 16px
  px: 1px
*/
/*
  CSS RELATIVE UNITS
  https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units
  em: 16px -> :root base
  rem: 16px -> :root base
  ex: NOT_IMPLEMENTED -> not supported -> fallback to px
  ch: NOT_IMPLEMENTED -> not supported -> fallback to px
  vw: SCREEN DIMENSIONS WIDTH -> viewport width TODO: implement size change listener
  vh: SCREEN DIMENSIONS HEIGHT -> viewport height TODO: implement size change listener
  vmin: SCREEN DIMENSIONS MIN -> viewport min between width and height TODO: implement size change listener
  vmax: SCREEN DIMENSIONS MAX -> viewport max between width and height TODO: implement size change listener
  %: RELATIVE TO PARENT ELEMENT
*/
export type Units = {
  '%'?: number;
  vw?: number;
  vh?: number;
  vmin?: number;
  vmax?: number;
  em: number;
  rem: number;
  px: number;
  pt: number;
  pc: number;
  in: number;
  cm: number;
  mm: number;
};

export type Context = {
  orientation: 'portrait' | 'landscape';
  resolution: number;
  prefersReducedMotion: 'no-preference' | 'reduce';
  deviceWidth: number;
  deviceHeight: number;
  deviceAspectRatio: number;
  units: Units;
};

export type AnyStyle = ViewStyle | TextStyle | ImageStyle;

export type CompleteStyle = ViewStyle & TextStyle & ImageStyle;

export type PartialStyle = Partial<Record<keyof CompleteStyle, string>> & {
  shadowOffset?: {
    width: string;
    height: string;
  };
  textShadowOffset?: {
    width: string;
    height: string;
  };
  textOverflow?: 'ellipsis';
  transform?: Transform[];
};

export type Style = PartialStyle & {
  hover?: PartialStyle;
  media?: MediaQuery[];
};

export type MediaQuery = (context: Context) => false | PartialStyle;

export type Transform = {
  scaleX?: string;
  scaleY?: string;
  translateX?: string;
  translateY?: string;
  skewX?: string;
  skewY?: string;
  perspective?: string;
  rotateX?: string;
  rotateY?: string;
  rotateZ?: string;
  rotate?: string;
};

export interface CssLexerState {
  cursor: number;
  targetString: string;
}
