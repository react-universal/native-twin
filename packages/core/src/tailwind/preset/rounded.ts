import plugin from 'tailwindcss/plugin';

export const rounded = plugin(({ matchUtilities, theme }) => {
  // @ts-expect-error
  const baseRem = theme('variables')['--rem'];
  matchUtilities(
    {
      rounded: (value: unknown) => {
        let [radius] = Array.isArray(value) ? value : [value];
        if (radius.endsWith('rem')) {
          radius = parseFloat(radius) * baseRem;
        }

        const result = {
          borderRadius: radius,
        };
        return result;
      },
    },
    {
      values: theme('borderRadius'),
      type: ['absolute-size', 'relative-size', 'length', 'percentage'],
    },
  );
});
