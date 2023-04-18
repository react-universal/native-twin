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

describe('TailwindCSS Aspect Ratio', () => {
  it('aspect-square', () => {
    const css = twj('aspect-square');
    expect(css).toStrictEqual({
      '.aspect-square': {
        aspectRatio: '1',
      },
    });
  });
  it('aspect-video', () => {
    const css = twj('aspect-video');
    expect(css).toStrictEqual({
      '.aspect-video': {
        aspectRatio: '1.777777778',
      },
    });
  });
  it('aspect-auto', () => {
    const css = twj('aspect-auto');
    expect(css).toStrictEqual({
      '.aspect-auto': {
        aspectRatio: '0',
      },
    });
  });
});
