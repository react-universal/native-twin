import { describe, expect, it } from 'vitest';
import { setup } from '../src';
import { reactNativeTailwindPreset } from '../src/tailwind/preset/tailwind-preset';

const tw = setup({ content: ['__'], presets: [reactNativeTailwindPreset()] });

describe('TailwindCSS Space', () => {
  it('Margin', () => {
    const css = tw.style('m-2');
    expect(css.JSS).toStrictEqual({
      '.m-2': {
        margin: '8px',
      },
    });
  });
  it('Margin Top', () => {
    const css = tw.style('mt-2');
    expect(css.JSS).toStrictEqual({
      '.mt-2': {
        marginTop: '8px',
      },
    });
  });
  it('Space X', () => {
    const css = tw.style('space-y-2');
    expect(css.JSS).toStrictEqual({});
  });
  it('Divide X', () => {
    const css = tw.style('divide-x-2');
    expect(css.JSS).toStrictEqual({});
  });
});
