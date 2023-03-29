import plugin from 'tailwindcss/plugin';

export const scale = plugin(function ({ matchUtilities, theme }) {
  // @ts-expect-error
  const baseRem = theme('variables')['--rem'];
  matchUtilities(
    {
      scale(value: string) {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          transform: `scale(${value}, ${value})`,
        };
      },
      'scale-x'(value: string) {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          transform: `scaleX(${value})`,
        };
      },
      'scale-y'(value: string) {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          transform: `scaleY(${value})`,
        };
      },
    },
    {
      values: theme('scale'),
      supportsNegativeValues: true,
    },
  );
});
