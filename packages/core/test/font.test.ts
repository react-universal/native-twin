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
    const css = tw.css('text-2xl');
    expect(css.JSS).toStrictEqual({
      '.text-2xl': {
        fontSize: '24px',
        lineHeight: '32px',
      },
    });
  });
  it('font-family', () => {
    const css = tw.css('font-inter');
    expect(css.JSS).toStrictEqual({
      '.font-inter': {
        fontFamily: 'Inter-Regular',
      },
    });
  });
});
