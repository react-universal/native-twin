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
