import { PixelRatio, Platform, PlatformOSType } from 'react-native';
import { atom, useAtomValue } from '@native-twin/helpers';
import { colorScheme } from './colorScheme.obs';
import { twinConfigObservable } from './twin.observer';
import { viewport } from './viewport.obs';

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

export type StyledContext = {
  orientation: 'portrait' | 'landscape';
  resolution: number;
  fontScale: number;
  deviceWidth: number;
  deviceHeight: number;
  deviceAspectRatio: number;
  platform: PlatformOSType;
  colorScheme: 'dark' | 'light';
  units: Units;
};

export const styledContext = atom((get): StyledContext => {
  const { height: vh$, width: vw$ } = get(viewport);
  const rem = get(twinConfigObservable)?.root.rem ?? 14;
  return {
    colorScheme: get(colorScheme) ?? 'light',
    deviceAspectRatio: vw$ / vh$,
    deviceHeight: vh$,
    deviceWidth: vw$,
    orientation: vw$ > vh$ ? 'landscape' : 'portrait',
    resolution: PixelRatio.getPixelSizeForLayoutSize(vw$),
    fontScale: PixelRatio.getFontScale(),
    platform: Platform.OS,
    units: {
      rem,
      em: rem,
      cm: 37.8,
      mm: 3.78,
      in: 96,
      pt: 1.33,
      pc: 16,
      px: 1,
      vmin: vw$ < vh$ ? vw$ : vh$,
      vmax: vw$ > vh$ ? vw$ : vh$,
      vw: vw$,
      vh: vh$,
    },
  };
});

export const useStyledContext = () => useAtomValue(styledContext);
