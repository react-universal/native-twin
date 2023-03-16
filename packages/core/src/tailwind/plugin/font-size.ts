import type { PluginAPI } from 'tailwindcss/types/config';
import { isPlainObject } from './utils';

/**
 * This "fixes" the fontSize plugin to calculate relative lineHeight's
 * based upon the fontsize. lineHeight's with units are kept as is
 *
 * Eg
 * { lineHeight: 1, fontSize: 12 } -> { lineHeight: 12, fontSize 12}
 * { lineHeight: 1px, fontSize: 12 } -> { lineHeight: 1px, fontSize 12}
 */
export const fontSize = ({ matchUtilities, theme }: PluginAPI) => {
  matchUtilities(
    {
      text: (value: unknown) => {
        let [fontSize, options] = Array.isArray(value) ? value : [value];
        if (fontSize.endsWith('rem')) {
          fontSize = parseFloat(fontSize) * 16;
        }
        let { lineHeight, letterSpacing } = isPlainObject(options)
          ? options
          : { lineHeight: options, letterSpacing: undefined };

        if (lineHeight && lineHeight.endsWith('rem')) {
          lineHeight = parseFloat(lineHeight) * 16;
        }
        if (letterSpacing && letterSpacing.endsWith('rem')) {
          letterSpacing = parseFloat(letterSpacing) * 16;
        }

        const result = {
          'font-size': fontSize,
          ...(lineHeight === undefined
            ? {}
            : {
                'line-height': `${lineHeight}px`,
              }),
          ...(letterSpacing === undefined ? {} : { 'letter-spacing': letterSpacing }),
        };
        return result;
      },
    },
    {
      values: theme('fontSize'),
      type: ['absolute-size', 'relative-size', 'length', 'percentage'],
    },
  );
};
