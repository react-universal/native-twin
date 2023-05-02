import { describe, expect, it } from 'vitest';
import { tailwindToCSS } from '../src';
import { reactNativeTailwindPreset } from '../src/util/tailwind/preset/tailwind-preset';

const { twj } = tailwindToCSS({
  config: {
    theme: {
      extend: {
        fontFamily: {
          inter: 'Inter-Regular',
          'inter-bold': 'Inter-Bold',
          'inter-medium': 'Inter-Medium',
          sans: 'Inter-Regular',
        },
      },
    },
    corePlugins: { preflight: false },
    presets: [reactNativeTailwindPreset({ baseRem: 16 })],
  },
  options: {
    ignoreMediaQueries: false,
    merge: false,
    minify: false,
  },
});

describe('TailwindCSS Font', () => {
  it('font-size', () => {
    const css = twj('text-2xl');
    expect(css).toStrictEqual({
      '.text-2xl': {
        fontSize: '24px',
        lineHeight: '32px',
      },
    });
  });

  it('font-family', () => {
    const css = twj('font-inter');
    expect(css).toStrictEqual({
      '.font-inter': {
        fontFamily: 'Inter-Regular',
      },
    });
  });

  it('leading', () => {
    const css = twj('leading-5');
    expect(css).toStrictEqual({
      '.leading-5': {
        lineHeight: '20px',
      },
    });
  });
});
