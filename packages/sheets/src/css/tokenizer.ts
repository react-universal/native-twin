import { Platform } from 'react-native';
import { CssResolver } from '@universal-labs/css';
import type { Context } from './css.types';

const platformMatch = /web|ios|android|native+/;

export const evaluateTwUtilities = (target: string[], context: Context) => {
  const purged = target.filter((item) =>
    platformMatch.test(item) ? item.includes(Platform.OS) : true,
  );
  return CssResolver(purged, {
    deviceHeight: context.deviceHeight,
    deviceWidth: context.deviceHeight,
    rem: context.units.rem,
  });
};
