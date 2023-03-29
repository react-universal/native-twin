import plugin from 'tailwindcss/plugin';

export const rotate = plugin(function ({ matchUtilities, theme }) {
  // @ts-expect-error
  const baseRem = theme('variables')['--rem'];
  matchUtilities(
    {
      rotate(value: string) {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          transform: `rotate(${value})`,
        };
      },
    },
    {
      values: theme('rotate'),
      supportsNegativeValues: true,
    },
  );
});
