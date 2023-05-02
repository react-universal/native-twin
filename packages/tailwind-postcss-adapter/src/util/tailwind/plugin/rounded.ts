import type { PluginAPI } from 'tailwindcss/types/config';

/**
 * This "fixes" the fontSize plugin to calculate relative lineHeight's
 * based upon the fontsize. lineHeight's with units are kept as is
 *
 * Eg
 * { lineHeight: 1, fontSize: 12 } -> { lineHeight: 12, fontSize 12}
 * { lineHeight: 1px, fontSize: 12 } -> { lineHeight: 1px, fontSize 12}
 */
export const rounded = ({ matchUtilities, theme }: PluginAPI) => {
  matchUtilities(
    {
      rounded: (value: unknown) => {
        let [radius] = Array.isArray(value) ? value : [value];
        if (radius.endsWith('rem')) {
          radius = parseFloat(radius) * 16;
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
};
