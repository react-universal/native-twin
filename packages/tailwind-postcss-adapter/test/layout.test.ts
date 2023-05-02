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

describe('TailwindCSS layout', () => {
  it('Width', () => {
    const css = twj('w-4');
    expect(css).toStrictEqual({
      '.w-4': {
        width: '16px',
      },
    });
  });

  it('Height', () => {
    const css = twj('h-4');
    expect(css).toStrictEqual({
      '.h-4': {
        height: '16px',
      },
    });
  });
});
