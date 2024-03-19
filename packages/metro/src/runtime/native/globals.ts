import { ComponentState, createContext } from 'react';
import {
  AccessibilityInfo,
  AppState,
  Appearance,
  Dimensions,
  NativeEventSubscription,
} from 'react-native';
import { INTERNAL_RESET, INTERNAL_SET } from '../../shared';
import { Effect, Observable, observable } from '../observable';

export const warnings = new Map<string, any[]>();
export const warned = new Set<string>();

export const externalCallbackRef = {} as {
  current: ((className: string) => void) | undefined;
};

export const rootVariables: Record<string, Observable<any>> = {};
export const universalVariables: Record<string, Observable<any>> = {};

export const variableContext = createContext<Record<string, any>>(rootVariables);
export const containerContext = createContext<Record<string, ComponentState>>({});

/**
 * Color scheme
 */
export const systemColorScheme = observable<'light' | 'dark'>(
  Appearance.getColorScheme() ?? 'light',
);
const colorSchemeObservable = observable<'light' | 'dark' | undefined>(undefined, {
  fallback: systemColorScheme,
});

export const colorScheme = {
  set(value: 'light' | 'dark' | 'system') {
    if (value === 'system') {
      colorSchemeObservable.set(undefined);
      appearance.setColorScheme(null);
    } else {
      colorSchemeObservable.set(value);
      appearance.setColorScheme(value);
    }
  },
  get: colorSchemeObservable.get,
  toggle() {
    let current = colorSchemeObservable.get();
    if (current === undefined) current = appearance.getColorScheme() ?? 'light';
    colorSchemeObservable.set(current === 'light' ? 'dark' : 'light');
  },
  [INTERNAL_RESET]: (appearance: typeof Appearance) => {
    colorSchemeObservable.set(undefined);
    resetAppearanceListeners(appearance, AppState);
  },
};

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
      systemColorScheme.set(state.colorScheme ?? 'light');
    }
  });

  appStateListener = appState.addEventListener('change', (type) => {
    if (type === 'active') {
      systemColorScheme.set(appearance.getColorScheme() ?? 'light');
    }
  });
}
resetAppearanceListeners(appearance, AppState);

/**
 * rem unit value
 */
export const rem = observable(14);

/**
 * Viewport Units
 */
const viewport = observable(Dimensions.get('window'));
let windowEventSubscription: ReturnType<typeof Dimensions.addEventListener>;
const viewportReset = (dimensions: Dimensions) => {
  viewport.set(dimensions.get('window'));
  windowEventSubscription?.remove();
  windowEventSubscription = dimensions.addEventListener('change', (size) => {
    return viewport.set(size.window);
  });
};
viewportReset(Dimensions);
export const vw = {
  get: (effect?: Effect) => viewport.get(effect).width,
  [INTERNAL_RESET]: viewportReset,
  [INTERNAL_SET](value: number) {
    viewport.set({ ...viewport.get(), width: value });
  },
};
export const vh = {
  get: (effect?: Effect) => viewport.get(effect).height,
  [INTERNAL_RESET]: viewportReset,
  [INTERNAL_SET](value: number) {
    viewport.set({ ...viewport.get(), height: value });
  },
};

/**
 * isReduceMotionEnabled
 */
export const isReduceMotionEnabled = Object.assign(
  observable<boolean>(false, { name: 'isReduceMotionEnabled' }),
  { [INTERNAL_RESET]: () => isReduceMotionEnabled.set(false) },
);
// Hopefully this resolves before the first paint...
AccessibilityInfo.isReduceMotionEnabled()?.then(isReduceMotionEnabled.set);
AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
  isReduceMotionEnabled.set(value);
});
