import type { CustomPluginFunction } from './types';

export const space: CustomPluginFunction = ({ matchUtilities, theme }, notSupported) => {
  matchUtilities(
    {
      space: () => {
        return {};
      },
      'space-x': (value: string) => {
        if (value === 'reverse') {
          notSupported('space-x-reverse')();
          return {
            'margin-left': '0px',
          };
        }

        value = value === '0' ? '0px' : value;

        return {
          'margin-left': value,
        };
      },
      'space-y': (value: string) => {
        if (value === 'reverse') {
          notSupported('space-y-reverse')();
          return {
            'margin-top': '0px',
          };
        }

        value = value === '0' ? '0px' : value;

        return {
          'margin-top': value,
        };
      },
    },
    { values: { ...theme('space'), reverse: 'reverse' } },
  );
};
