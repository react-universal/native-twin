import { Appearance } from 'react-native';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

const checkAppearance = () => {
  const subscription = Appearance.addChangeListener(() => {});
  return () => {
    subscription.remove();
  };
};
const useIsDarkMode = () => {
  return useSyncExternalStore(
    checkAppearance,
    () => Appearance.getColorScheme() === 'light',
    () => Appearance.getColorScheme() === 'light',
  );
};

export { useIsDarkMode };
