import { Appearance } from 'react-native';

const useIsDarkMode = () => {
  return Appearance.getColorScheme() === 'dark';
};

export { useIsDarkMode };
