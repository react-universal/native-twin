import type { TwinRuntimeContext } from '@native-twin/core';
import { atom } from '@native-twin/helpers/react';
import {
  AccessibilityInfo,
  Appearance,
  AppState,
  type ColorSchemeName,
  Dimensions,
  type NativeEventSubscription,
  PixelRatio,
  Platform,
} from 'react-native';

export const INTERNAL_RESET = Symbol.for('INTERNAL_RESET');
export const colorScheme = atom<ColorSchemeName>(Appearance.getColorScheme() ?? 'light');

/**
 * Appearance
 */
let appearance = Appearance;
let appearanceListener: NativeEventSubscription | undefined;
let appStateListener: NativeEventSubscription | undefined;

function resetAppearanceListeners($appearance: typeof Appearance, appState: typeof AppState) {
  appearance = $appearance;
  appearanceListener?.remove();
  appStateListener?.remove();

  appearanceListener = appearance.addChangeListener((state) => {
    if (AppState.currentState === 'active') {
      colorScheme.set(state.colorScheme ?? 'light');
    }
  });

  appStateListener = appState.addEventListener('change', (type) => {
    if (type === 'active') {
      colorScheme.set(appearance.getColorScheme() ?? 'light');
    }
  });
}

/**
 * isReduceMotionEnabled
 */
export const isReduceMotionEnabled = Object.assign(atom<boolean>(false), {
  [INTERNAL_RESET]: () => isReduceMotionEnabled.set(false),
});
// Hopefully this resolves before the first paint...
AccessibilityInfo.isReduceMotionEnabled()?.then(isReduceMotionEnabled.set);
AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
  isReduceMotionEnabled.set(value);
});

resetAppearanceListeners(appearance, AppState);

/**
 * ViewPort
 */
export const viewport = atom(Dimensions.get('window'));

let windowEventSubscription: ReturnType<typeof Dimensions.addEventListener>;
const viewportReset = (dimensions: Dimensions) => {
  viewport.set(dimensions.get('window'));
  windowEventSubscription?.remove();
  windowEventSubscription = dimensions.addEventListener('change', (size) => {
    return viewport.set(size.window);
  });
};
viewportReset(Dimensions);

export const vw = atom((get) => get(viewport).width);
export const vh = atom((get) => get(viewport).height);

/**
 * TwinRuntimeContext
 */

export const remObs = atom(14);

export const styledContext = atom((get): TwinRuntimeContext => {
  const { height: vh$, width: vw$ } = get(viewport);
  const rem = get(remObs);
  const colorSc = get(colorScheme) ?? 'light';
  return {
    colorScheme: colorSc,
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
