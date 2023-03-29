import plugin from 'tailwindcss/plugin';

export const width = plugin(function ({ matchUtilities, theme }) {
  // @ts-expect-error
  const baseRem = theme('variables')['--rem'];
  matchUtilities(
    {
      w: (value: string) => {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          width: value,
        };
      },
    },
    { values: { ...theme('width') }, supportsNegativeValues: true },
  );
});
