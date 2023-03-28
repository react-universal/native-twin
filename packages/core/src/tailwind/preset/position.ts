import plugin from 'tailwindcss/plugin';

export const position = plugin(function ({ matchUtilities, theme }) {
  // @ts-expect-error
  const baseRem = theme('variables')['--rem'];
  matchUtilities(
    {
      top(value: string) {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }

        return {
          top: value,
        };
      },
      bottom(value: string) {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }

        return {
          bottom: value,
        };
      },
      right(value: string) {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }

        return {
          right: value,
        };
      },
      left(value: string) {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }

        return {
          left: value,
        };
      },
      inset(value: string) {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }

        return {
          top: value,
          bottom: value,
          right: value,
          left: value,
        };
      },
      'inset-y'(value: string) {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }

        return {
          top: value,
          bottom: value,
        };
      },
      'inset-x'(value: string) {
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }

        return {
          right: value,
          left: value,
        };
      },
    },
    {
      values: { ...theme('inset') },
      supportsNegativeValues: true,
    },
  );
});
