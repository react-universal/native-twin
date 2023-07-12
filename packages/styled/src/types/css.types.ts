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
