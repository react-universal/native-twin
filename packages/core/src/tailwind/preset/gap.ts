import plugin from 'tailwindcss/plugin';

export const gap = plugin(function ({ matchUtilities, theme }) {
  matchUtilities(
    {
      gap: (value: string) => {
        value = value === '0' ? '0px' : value;
        value = value === 'px' ? '1px' : value;
        if (value?.endsWith('rem')) {
          value = `${parseFloat(value) * 16}px`;
        }

        return {
          gap: value,
        };
      },
      'gap-x': (value: string) => {
        value = value === '0' ? '0px' : value;
        value = value === 'px' ? '1px' : value;
        if (value?.endsWith('rem')) {
          value = `${parseFloat(value) * 16}px`;
        }

        return {
          columnGap: value,
        };
      },
      'gap-y': (value: string) => {
        value = value === '0' ? '0px' : value;
        value = value === 'px' ? '1px' : value;
        if (value?.endsWith('rem')) {
          value = `${parseFloat(value) * 16}px`;
        }

        return {
          rowGap: value,
        };
      },
    },
    { values: theme('gap') },
  );
});
