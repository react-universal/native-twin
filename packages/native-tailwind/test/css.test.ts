import { describe, expect, it } from 'vitest';
import {
  defineConfig,
  setup,
  tx,
  sheetEntriesToCss,
  matchThemeColor,
  matchThemeValue,
} from '../src';

setup(
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
    const entries = tx`bg-primary !px-1 first-letter:px-2 asd md:sm:px-2`;
    const css = sheetEntriesToCss(entries);
    // console.log('CSS: ', css);
    // console.log('ENTRIES: ', tw.sheet);
    expect(css).toStrictEqual(
      '@media (min-width:740px){@media (min-width:640px){.md\\:sm\\:px-2{padding-left:2rem;padding-right:2rem;}}}\n' +
        '.first-letter\\:px-2::first-letter{padding-left:2rem;padding-right:2rem;}\n' +
        '.\\!px-1{padding-left:1rem !important;padding-right:1rem !important;}\n' +
        '.asd{}\n' +
        '.bg-primary{background-color:blue;}',
    );
  });
});
