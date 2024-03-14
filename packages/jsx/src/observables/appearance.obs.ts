import { Appearance, AppState, NativeEventSubscription } from 'react-native';
import { createValueStore } from '@native-twin/helpers';
import { INTERNAL_RESET } from '../constants';
import { observable } from '../utils/observable';

/**
 * Color scheme
 */
export const systemColorScheme = observable<'light' | 'dark'>(
  Appearance.getColorScheme() ?? 'light',
);
const colorSchemeObservable = observable<'light' | 'dark' | undefined>(undefined, {
  fallback: systemColorScheme,
});

export const _colorSchemeStore = createValueStore(systemColorScheme, {
  name: 'colorScheme',
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
