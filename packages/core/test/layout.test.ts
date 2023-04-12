import { describe, expect, it } from 'vitest';
import { setup } from '../src';
import { reactNativeTailwindPreset } from '../src/tailwind/preset/tailwind-preset';

const tw = setup({ content: ['__'], presets: [reactNativeTailwindPreset()] });

describe('TailwindCSS layout', () => {
  it('Width', () => {
    const css = tw('w-4');
    expect(css).toStrictEqual({
      '.w-4': {
        width: '16px',
      },
    });
  });

  it('Height', () => {
    const css = tw('h-4');
    expect(css).toStrictEqual({
      '.h-4': {
        height: '16px',
      },
    });
  });
});
