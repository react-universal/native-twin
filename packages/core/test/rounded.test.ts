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

describe('TailwindCSS rounded', () => {
  it('Shadow', () => {
    const css = twj('rounded-xl');
    expect(css).toStrictEqual({
      '.rounded-xl': {
        borderRadius: '12px',
      },
    });
  });
});
