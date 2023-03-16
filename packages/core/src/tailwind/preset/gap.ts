import plugin from 'tailwindcss/plugin';

export const gap = plugin(function ({ matchUtilities, theme }) {
  // @ts-expect-error
  const baseRem = theme('variables')['--rem'];
  matchUtilities(
    {
      gap: (value: string) => {
        value = value === '0' ? '0px' : value;
        value = value === 'px' ? '1px' : value;
        if (value?.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }

        return {
          gap: value,
        };
      },
      'gap-x': (value: string) => {
        value = value === '0' ? '0px' : value;
        value = value === 'px' ? '1px' : value;
        if (value?.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }

        return {
          columnGap: value,
        };
      },
      'gap-y': (value: string) => {
        value = value === '0' ? '0px' : value;
        value = value === 'px' ? '1px' : value;
        if (value?.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }

        return {
          rowGap: value,
        };
      },
    },
    { values: theme('gap') },
  );
});
