import { PixelRatio, Platform } from 'react-native';
import { tw } from '@native-twin/core';
import { StyledContext } from '@native-twin/styled';
import { atom, useAtom } from '../atomic.store';
import { colorScheme } from './colorScheme.obs';
import { twinConfigObservable } from './twin.observer';
import { viewport } from './viewport.obs';

export const styledContext = atom((get): StyledContext => {
  const { height: vh$, width: vw$ } = get(viewport);
  const rem = get(twinConfigObservable)?.root.rem ?? 14;
  const config = get(twinConfigObservable);
  if (!config) {
    if ('observeConfig' in tw) {
      console.log('CAN_OBSERVE');
    }
  }
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
// const tailwindRemValue = atom(getTailwindConfig().config?.root.rem);
// /**
//  * rem unit value
//  */
// export const rem = atom((get) => {
//   const value = get(tailwindRemValue);
//   if (!value) {
//     const getConfig = getTailwindConfig();
//     if (getConfig) {
//       tailwindRemValue.set(getConfig.config.root.rem);
//       const newContext = get(styledContext);
//       newContext.units.rem = getConfig.config.root.rem;
//       newContext.units.em = getConfig.config.root.rem;
//       styledContext.set({
//         ...newContext,
//       });
//     }
//   }
//   return get(styledContext).units.rem ?? 2;
// });

export const useStyledContext = () => useAtom(styledContext);
