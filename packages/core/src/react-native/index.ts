import { useState, useEffect } from 'react';
import { Appearance } from 'react-native';

const useColorScheme = () => {
  const [scheme, setScheme] = useState(Appearance.getColorScheme());
  useEffect(() => {
    const handler = Appearance.addChangeListener((state) => {
      setScheme(state.colorScheme);
    });
    return () => {
      handler.remove();
    };
  }, []);
  return {
    scheme,
    isDark: scheme === 'dark',
  };
};

export { useColorScheme };
