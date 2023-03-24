import plugin from 'tailwindcss/plugin';

export const height = plugin(function ({ matchUtilities, theme }) {
  // @ts-expect-error
  const baseRem = theme('variables')['--rem'];
  matchUtilities(
    {
      h: (value: string) => {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          height: value,
        };
      },
    },
    { values: { ...theme('height') } },
  );
});
