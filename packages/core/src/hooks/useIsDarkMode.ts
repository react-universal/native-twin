import { Appearance } from 'react-native';

const useIsDarkMode = () => {
  return Appearance.getColorScheme() === 'light';
};

export { useIsDarkMode };
