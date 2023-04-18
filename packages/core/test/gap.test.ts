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

describe('TailwindCSS GAP', () => {
  it('gap', () => {
    const css = twj('gap-5');

    expect(css).toStrictEqual({
      '.gap-5': {
        gap: '20px',
      },
    });
  });

  it('gap-x', () => {
    const css = twj('gap-x-5');
    expect(css).toStrictEqual({
      '.gap-x-5': {
        columnGap: '20px',
      },
    });
  });

  it('gap-y', () => {
    const css = twj('gap-y-5');
    expect(css).toStrictEqual({
      '.gap-y-5': {
        rowGap: '20px',
      },
    });
  });
});
