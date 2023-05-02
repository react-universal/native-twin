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

describe('TailwindCSS Space', () => {
  it('Margin', () => {
    const css = twj('m-2');
    expect(css).toStrictEqual({
      '.m-2': {
        margin: '8px',
      },
    });
  });
  it('Margin Top', () => {
    const css = twj('mt-2');
    expect(css).toStrictEqual({
      '.mt-2': {
        marginTop: '8px',
      },
    });
  });
  it('Space X', () => {
    const css = twj('space-y-2');
    expect(css).toStrictEqual({});
  });
  it('Divide X', () => {
    const css = twj('divide-x-2');
    expect(css).toStrictEqual({});
  });
});
