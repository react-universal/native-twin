import plugin from 'tailwindcss/plugin';

export const margin = plugin(function ({ matchUtilities, theme }) {
  // @ts-expect-error
  const baseRem = theme('variables')['--rem'];
  matchUtilities(
    {
      mt: (value: string) => {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          'margin-top': value,
        };
      },
      mx: (value: string) => {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          'margin-left': value,
          'margin-right': value,
        };
      },
      my: (value: string) => {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          'margin-top': value,
          'margin-bottom': value,
        };
      },
      mb: (value: string) => {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          'margin-bottom': value,
        };
      },
      ml: (value: string) => {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          'margin-left': value,
        };
      },
      mr: (value: string) => {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          'margin-right': value,
        };
      },
      m: (value: string) => {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          margin: value,
        };
      },
    },
    { values: { ...theme('margin'), reverse: 'reverse' }, supportsNegativeValues: true },
  );
});
