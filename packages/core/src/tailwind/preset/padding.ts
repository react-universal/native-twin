import plugin from 'tailwindcss/plugin';

export const padding = plugin(({ matchUtilities, theme }) => {
  // @ts-expect-error
  const baseRem = theme('variables')['--rem'];
  matchUtilities(
    {
      padding: (value: string) => {
        return {
          margin: value,
        };
      },
      pt: (value: string) => {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          'padding-top': value,
        };
      },
      px: (value: string) => {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          'padding-left': value,
          'padding-right': value,
        };
      },
      py: (value: string) => {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          'padding-top': value,
          'padding-bottom': value,
        };
      },
      pb: (value: string) => {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          'padding-bottom': value,
        };
      },
      pl: (value: string) => {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          'padding-left': value,
        };
      },
      pr: (value: string) => {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          'padding-right': value,
        };
      },
      p: (value: string) => {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }
        return {
          padding: value,
        };
      },
    },
    { values: { ...theme('padding'), reverse: 'reverse' }, supportsNegativeValues: true },
  );
});
