import { describe, expect, it } from 'vitest';
import { setup } from '../src';
import nativePreset from '../src/tailwind/preset/tailwind-preset';

const tw = setup({
  content: ['__'],
  presets: [nativePreset({ baseRem: 16 })],
});

describe('TailwindCSS Font', () => {
  it('font-size', () => {
    const css = tw.style('text-2xl');
    expect(css.JSS).toStrictEqual({
      '.text-2xl': {
        fontSize: '24px',
        lineHeight: '32px',
      },
    });
  });
});
