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

describe('TailwindCSS platform variants (web)', () => {
  it('Shadow', () => {
    const css = twj('web:rounded-xl ios:rounded-sm');
    expect(css).toStrictEqual({
      '@media ios': {
        '.ios\\:rounded-sm': {
          borderRadius: '2px',
        },
      },
      '@media web': {
        '.web\\:rounded-xl': {
          borderRadius: '12px',
        },
      },
    });
  });
});
