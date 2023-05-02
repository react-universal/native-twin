import { describe, expect, it } from 'vitest';
import { tailwindToCSS } from '../src';
import { reactNativeTailwindPreset } from '../src/util/tailwind/preset/tailwind-preset';

const { twj } = tailwindToCSS({
  config: {
    corePlugins: { preflight: false },
    presets: [reactNativeTailwindPreset({ baseRem: 16 })],
  },
  options: {
    ignoreMediaQueries: false,
    merge: false,
    minify: false,
  },
});

describe('TailwindCSS Shadow', () => {
  it('Shadow', () => {
    const css = twj('shadow-md');
    expect(css).toStrictEqual({
      '.shadow-md': {
        boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.1)',
        elevation: '6',
      },
    });
  });
});
