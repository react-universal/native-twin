import { useColorScheme } from '@medico/universal/color-scheme';

export const useIsDarkMode = () => {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark';
};
