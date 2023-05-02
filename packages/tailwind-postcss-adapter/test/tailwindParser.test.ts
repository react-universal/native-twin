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

describe('TailwindCSS compiler', () => {
  it('Normal color', () => {
    const css = twj('bg-black');
    expect(css).toStrictEqual({
      '.bg-black': {
        backgroundColor: '#000',
      },
    });
  });

  it('Color with opacity', () => {
    const css = twj('bg-black/50');
    expect(css).toStrictEqual({
      '.bg-black\\/50': {
        backgroundColor: 'rgba(0,0,0,0.5)',
      },
    });
  });

  it('Translations', () => {
    const css = twj('translate-x-8');
    expect(css).toStrictEqual({
      '.translate-x-8': {
        transform: 'translate(32px)',
      },
    });
  });
});
