import { describe, expect, it } from 'vitest';
import {
  defineConfig,
  setup,
  tx,
  sheetEntriesToCss,
  matchThemeColor,
  matchThemeValue,
} from '../src';

const tw = setup(
  defineConfig({
    rules: [
      matchThemeColor('bg-', 'backgroundColor'),
      matchThemeValue('p', 'spacing', 'padding', {
        canBeNegative: true,
        feature: 'edges',
        prefix: 'padding',
      }),
    ],
    theme: {
      screens: {
        md: '640px',
        sm: '740px',
      },
      colors: {
        primary: 'blue',
      },
      spacing: {
        1: '1rem',
        2: '2rem',
      },
    },
  }),
);

describe('@universal-labs/native-twin - Raw rules parser', () => {
  it('Sheet entries to CSS', () => {
    const entries = tx`bg-primary px-1 asd md:sm:px-2`;
    const css = sheetEntriesToCss(entries, tw.config.theme['screens']);
    expect(css).toStrictEqual(
      '.bg-primary{background-color:blue;}\n' +
        '.px-1{padding-left:1rem;padding-right:1rem;}\n' +
        '.asd{}\n' +
        '@media (min-width: 640px){.md\\:sm\\:px-2{padding-left:2rem;padding-right:2rem;}}@media (min-width: 740px){.md\\:sm\\:px-2{padding-left:2rem;padding-right:2rem;}}',
    );
  });
});
