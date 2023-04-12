import { describe, expect, it } from 'vitest';
import { setup } from '../src';
import { reactNativeTailwindPreset } from '../src/tailwind/preset/tailwind-preset';

const tw = setup({
  content: ['__'],
  presets: [reactNativeTailwindPreset({ baseRem: 16 })],
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
});

describe('TailwindCSS Font', () => {
  it('font-size', () => {
    const css = tw('text-2xl');
    expect(css).toStrictEqual({
      '.text-2xl': {
        fontSize: '24px',
        lineHeight: '32px',
      },
    });
  });

  it('font-family', () => {
    const css = tw('font-inter');
    expect(css).toStrictEqual({
      '.font-inter': {
        fontFamily: 'Inter-Regular',
      },
    });
  });

  it('leading', () => {
    const css = tw('leading-5');
    expect(css).toStrictEqual({
      '.leading-5': {
        lineHeight: '20px',
      },
    });
  });
});
