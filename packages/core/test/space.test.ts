import { describe, expect, it } from 'vitest';
import { setup } from '../src';
import nativePreset from '../src/tailwind/preset/tailwind-preset';

const tw = setup({ content: ['__'], presets: [nativePreset()] });

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
});
