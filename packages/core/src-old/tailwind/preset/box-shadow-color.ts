import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette';
import toColorValue from 'tailwindcss/lib/util/toColorValue';
import plugin from 'tailwindcss/plugin';

export const boxShadowColor = plugin(({ matchUtilities, theme }) => {
  matchUtilities(
    {
      shadow: (value: unknown) => {
        return {
          shadowColor: toColorValue(value),
        };
      },
    },
    { values: flattenColorPalette(theme('boxShadowColor')), type: ['color'] },
  );
});
