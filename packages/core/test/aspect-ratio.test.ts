import { describe, expect, it } from 'vitest';
import { setup } from '../src';
import { reactNativeTailwindPreset } from '../src/tailwind/preset/tailwind-preset';

const tw = setup({
  content: ['__'],
  presets: [reactNativeTailwindPreset({ baseRem: 16 })],
});

describe('TailwindCSS Aspect Ratio', () => {
  it('aspect-square', () => {
    const css = tw.style('aspect-square');
    expect(css.JSS).toStrictEqual({
      '.aspect-square': {
        aspectRatio: '1',
      },
    });
  });
  it('aspect-video', () => {
    const css = tw.style('aspect-video');
    expect(css.JSS).toStrictEqual({
      '.aspect-video': {
        aspectRatio: '1.777777778',
      },
    });
  });
  it('aspect-auto', () => {
    const css = tw.style('aspect-auto');
    expect(css.JSS).toStrictEqual({
      '.aspect-auto': {
        aspectRatio: '0',
      },
    });
  });
});
