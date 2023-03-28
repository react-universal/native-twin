import { describe, expect, it } from 'vitest';
import { setup } from '../src';
import { reactNativeTailwindPreset } from '../src/tailwind/preset/tailwind-preset';

const tw = setup({
  content: ['__'],
  presets: [reactNativeTailwindPreset({ baseRem: 16 })],
});

describe('TailwindCSS Position', () => {
  it('Right', () => {
    const css = tw.css('right-3');
    expect(css.JSS).toStrictEqual({
      '.right-3': {
        right: '12px',
      },
    });
  });

  it('Left', () => {
    const css = tw.css('left-3');
    expect(css.JSS).toStrictEqual({
      '.left-3': {
        left: '12px',
      },
    });
  });

  it('Top', () => {
    const css = tw.css('top-3');
    expect(css.JSS).toStrictEqual({
      '.top-3': {
        top: '12px',
      },
    });
  });

  it('Bottom', () => {
    const css = tw.css('bottom-3');
    expect(css.JSS).toStrictEqual({
      '.bottom-3': {
        bottom: '12px',
      },
    });
  });

  it('Inset', () => {
    const css = tw.css('inset-3');
    expect(css.JSS).toStrictEqual({
      '.inset-3': {
        bottom: '12px',
        top: '12px',
        right: '12px',
        left: '12px',
      },
    });
  });

  it('Negative Inset', () => {
    const css = tw.css('-inset-3');
    expect(css.JSS).toStrictEqual({
      '.-inset-3': {
        bottom: '-12px',
        top: '-12px',
        right: '-12px',
        left: '-12px',
      },
    });
  });

  it('Inset Y', () => {
    const css = tw.css('inset-y-3');
    expect(css.JSS).toStrictEqual({
      '.inset-y-3': {
        bottom: '12px',
        top: '12px',
      },
    });
  });

  it('Negative Inset Y', () => {
    const css = tw.css('-inset-y-3');
    expect(css.JSS).toStrictEqual({
      '.-inset-y-3': {
        bottom: '-12px',
        top: '-12px',
      },
    });
  });

  it('Negative Inset X', () => {
    const css = tw.css('-inset-x-3');
    expect(css.JSS).toStrictEqual({
      '.-inset-x-3': {
        right: '-12px',
        left: '-12px',
      },
    });
  });

  it('Inset X', () => {
    const css = tw.css('inset-x-3');
    expect(css.JSS).toStrictEqual({
      '.inset-x-3': {
        right: '12px',
        left: '12px',
      },
    });
  });
});
