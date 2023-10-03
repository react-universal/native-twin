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
      colors: {
        primary: 'blue',
      },
      spacing: {
        1: '1rem',
      },
    },
  }),
);

describe('@universal-labs/native-twin - Raw rules parser', () => {
  it('Sheet entries to CSS', () => {
    const entries = tx`bg-primary px-1 asd`;
    const css = sheetEntriesToCss(entries);
    expect(css).toStrictEqual(
      '.bg-primary{background-color:blue;}\n' +
        '.px-1{padding-left:1rem;padding-right:1rem;}\n' +
        '.asd{}',
    );
  });
});
