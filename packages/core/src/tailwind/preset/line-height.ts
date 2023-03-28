import plugin from 'tailwindcss/plugin';

export const lineHeight = plugin(function ({ matchUtilities, theme }) {
  // @ts-expect-error
  const baseRem = theme('variables')['--rem'];
  matchUtilities(
    {
      leading(value: string) {
        // if (typeof value !== 'string') {
        //   return notSupported(`leading-${value}`)();
        // }
        if (value.endsWith('rem')) {
          value = `${parseFloat(value) * baseRem}px`;
        }

        return {
          lineHeight: value,
        };
      },
    },
    {
      values: { ...theme('lineHeight') },
    },
  );
});
