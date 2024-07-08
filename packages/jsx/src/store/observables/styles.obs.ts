import { PixelRatio, Platform } from 'react-native';
import { StyledContext } from '../../sheet/sheet.types';
import { atom, useAtomValue } from '../atomic.store';
import { colorScheme } from './colorScheme.obs';
import { twinConfigObservable } from './twin.observer';
import { viewport } from './viewport.obs';

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
