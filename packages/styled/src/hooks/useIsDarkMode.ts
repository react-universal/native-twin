import { useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';

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
