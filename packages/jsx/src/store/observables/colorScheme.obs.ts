/**
 * Color scheme
 */
import { AppState, Appearance, NativeEventSubscription } from 'react-native';
import { atom } from '../atomic.store';

export const colorScheme = atom(Appearance.getColorScheme() ?? 'light');

/**
 * Appearance
 */
let appearance = Appearance;
let appearanceListener: NativeEventSubscription | undefined;
let appStateListener: NativeEventSubscription | undefined;

function resetAppearanceListeners(
  $appearance: typeof Appearance,
  appState: typeof AppState,
) {
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
resetAppearanceListeners(appearance, AppState);
