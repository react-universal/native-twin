import { PixelRatio } from 'react-native';
import type { Units, Context } from '../css.types';

export function createContext(units: Pick<Units, 'rem' | 'vh' | 'vw'>): Context {
  const vw = units.vw ?? 1;
  const vh = units.vh ?? 1;
  return {
    deviceAspectRatio: vw / vh,
    deviceHeight: vh,
    deviceWidth: vw,
    orientation: vw > vh ? 'landscape' : 'portrait',
    prefersReducedMotion: 'no-preference',
    resolution: PixelRatio.getPixelSizeForLayoutSize(vw),
    units: {
      rem: units.rem,
      em: units.rem,
      cm: 37.8,
      mm: 3.78,
      in: 96,
      pt: 1.33,
      pc: 16,
      px: 1,
      vmin: vw < vh ? vw : vh,
      vmax: vw > vh ? vw : vh,
      vw,
      vh,
    },
  };
}
