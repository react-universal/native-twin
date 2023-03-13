import { getStylesForProperty } from 'css-to-react-native';
import type { CustomPluginFunction } from './types';

export const boxShadow: CustomPluginFunction = (
  { matchUtilities, theme, addComponents },
  notSupported,
) => {
  matchUtilities(
    {
      'shadow-inner': notSupported('shadow-inner'),
    },
    { values: theme('boxShadow'), type: ['shadow'] },
  );

  const themeValues = Object.entries(theme('boxShadow'));
  const elevation = theme('elevation');

  const shadowComponent = themeValues.map(([size, value]) => ({
    [key(size)]: {
      elevation: elevation[size],
      shadowColor: getStylesForProperty('boxShadow', value as string).shadowColor,
      boxShadow: value,
    },
  }));

  addComponents([shadowComponent]);
};

const key = (size: string) => {
  return size === 'DEFAULT' ? '.shadow' : `.shadow-${size}`;
};
