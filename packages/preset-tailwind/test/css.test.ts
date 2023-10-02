/* eslint-disable no-console */
import { defineConfig, setup, tw, tx, sheetEntriesToCss } from '@universal-labs/native-twin';
import { inspect } from 'util';
import { describe, expect, it } from 'vitest';
import { presetTailwind } from '../src';

setup(defineConfig({ presets: [presetTailwind()] }));

describe('@universal-labs/native-twin - Raw rules parser', () => {
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
    const css = sheetEntriesToCss(entries, tw.config.theme['screens']);
    console.log('ENTRIES: ', inspect(entries, false, null, true));
    console.log('CSS', inspect(css));
    expect(css).toStrictEqual(
      '.bg-blue-200{background-color:rgba(191,219,254,1);}\n' +
        '.text-center{text-align:center;}\n' +
        '.md\\:text-left{text-align:left;}@media (min-width: 768px){.md\\:text-left{text-align:left;}}',
    );
  });
});
