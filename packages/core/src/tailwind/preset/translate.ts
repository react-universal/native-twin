import plugin from 'tailwindcss/plugin';

export const translate = plugin(function ({ matchUtilities, theme }) {
  // @ts-expect-error
  const baseRem = theme('variables')['--rem'];
  matchUtilities(
    {
      translate(value: string) {
        return {
          transform: `translate(${parseFloat(value) * baseRem}px, ${
            parseFloat(value) * baseRem
          }px)`,
        };
      },
      'translate-x'(value: string) {
        return {
          transform: `translate(${parseFloat(value) * baseRem}px)`,
        };
      },
      'translate-y'(value: string) {
        return {
          transform: `translate(0, ${parseFloat(value) * baseRem}px)`,
        };
      },
    },
    {
      values: theme('translate'),
      supportsNegativeValues: true,
    },
  );
});
