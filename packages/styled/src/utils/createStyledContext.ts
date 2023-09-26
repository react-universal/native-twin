import { Appearance, PixelRatio, Platform } from 'react-native';
import type { StyledContext, Units } from '@universal-labs/native-tailwind';

export function createStyledContext(units: Pick<Units, 'rem' | 'vh' | 'vw'>): StyledContext {
  const vw = units.vw ?? 1;
  const vh = units.vh ?? 1;
  return {
    colorScheme: Appearance.getColorScheme()!,
    deviceAspectRatio: vw / vh,
    deviceHeight: vh,
    deviceWidth: vw,
    orientation: vw > vh ? 'landscape' : 'portrait',
    resolution: PixelRatio.getPixelSizeForLayoutSize(vw),
    fontScale: PixelRatio.getFontScale(),
    platform: Platform.OS,
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
