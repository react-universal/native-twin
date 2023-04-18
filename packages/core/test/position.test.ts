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

describe('TailwindCSS Position', () => {
  it('Right', () => {
    const css = twj('right-3');
    expect(css).toStrictEqual({
      '.right-3': {
        right: '12px',
      },
    });
  });

  it('Left', () => {
    const css = twj('left-3');
    expect(css).toStrictEqual({
      '.left-3': {
        left: '12px',
      },
    });
  });

  it('Top', () => {
    const css = twj('top-3');
    expect(css).toStrictEqual({
      '.top-3': {
        top: '12px',
      },
    });
  });

  it('Bottom', () => {
    const css = twj('bottom-3');
    expect(css).toStrictEqual({
      '.bottom-3': {
        bottom: '12px',
      },
    });
  });

  it('Inset', () => {
    const css = twj('inset-3');
    expect(css).toStrictEqual({
      '.inset-3': {
        bottom: '12px',
        top: '12px',
        right: '12px',
        left: '12px',
      },
    });
  });

  it('Negative Inset', () => {
    const css = twj('-inset-3');
    expect(css).toStrictEqual({
      '.-inset-3': {
        bottom: '-12px',
        top: '-12px',
        right: '-12px',
        left: '-12px',
      },
    });
  });

  it('Inset Y', () => {
    const css = twj('inset-y-3');
    expect(css).toStrictEqual({
      '.inset-y-3': {
        bottom: '12px',
        top: '12px',
      },
    });
  });

  it('Negative Inset Y', () => {
    const css = twj('-inset-y-3');
    expect(css).toStrictEqual({
      '.-inset-y-3': {
        bottom: '-12px',
        top: '-12px',
      },
    });
  });

  it('Negative Inset X', () => {
    const css = twj('-inset-x-3');
    expect(css).toStrictEqual({
      '.-inset-x-3': {
        right: '-12px',
        left: '-12px',
      },
    });
  });

  it('Inset X', () => {
    const css = twj('inset-x-3');
    expect(css).toStrictEqual({
      '.inset-x-3': {
        right: '12px',
        left: '12px',
      },
    });
  });
});
