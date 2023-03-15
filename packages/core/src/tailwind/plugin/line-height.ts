import type { CustomPluginFunction } from './types';

export const lineHeight: CustomPluginFunction = ({ matchUtilities, theme }, notSupported) => {
  matchUtilities(
    {
      leading(value: string) {
        if (typeof value !== 'string') {
          return notSupported(`leading-${value}`)();
        }
        if (value.endsWith('px')) {
          return { lineHeight: parseFloat(value) };
        }
        if (value.endsWith('rem')) {
          return { lineHeight: parseFloat(value) * 16 };
        }

        return notSupported(`leading-${value}`)();
      },
    },
    {
      values: { ...theme('lineHeight'), reverse: true },
      supportsNegativeValues: true,
    },
  );
};
