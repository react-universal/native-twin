/* eslint-disable no-console */
import { defineConfig, setup, tx, sheetEntriesToCss } from '@universal-labs/native-twin';
import { inspect } from 'util';
import { describe, expect, it } from 'vitest';
import { presetTailwind } from '../src';

setup(defineConfig({ presets: [presetTailwind()], mode: 'web' }));

describe('@universal-labs/preset-tailwind - Raw rules parser', () => {
  it('Sheet entries to CSS', () => {
    const entries = tx`bg-blue-200 text-center`;
    const css = sheetEntriesToCss(entries);
    expect(css).toStrictEqual(
      '.bg-blue-200{background-color:rgba(191,219,254,1);}\n' +
        '.text-center{text-align:center;}',
    );
  });
  it('Sheet entries to CSS', () => {
    const entries = tx`bg-blue-200 text-center md:text-left`;
    const css = sheetEntriesToCss(entries);
    console.log('CSS', inspect(css));
    console.log('ENTRIES: ', inspect(entries, false, null, true));
    expect(css).toStrictEqual(
      '.bg-blue-200{background-color:rgba(191,219,254,1);}\n' +
        '.text-center{text-align:center;}\n' +
        '@media (min-width:768px){.md\\:text-left{text-align:left;}}',
    );
  });
});
