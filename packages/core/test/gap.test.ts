import { describe, expect, it } from 'vitest';
import { setup } from '../src';
import { reactNativeTailwindPreset } from '../src/tailwind/preset/tailwind-preset';

const tw = setup({ content: ['__'], presets: [reactNativeTailwindPreset()] });

describe('TailwindCSS GAP', () => {
  it('gap', () => {
    const css = tw('gap-5');
    expect(css).toStrictEqual({
      '.gap-5': {
        gap: '20px',
      },
    });
  });

  it('gap-x', () => {
    const css = tw('gap-x-5');
    expect(css).toStrictEqual({
      '.gap-x-5': {
        columnGap: '20px',
      },
    });
  });

  it('gap-y', () => {
    const css = tw('gap-y-5');
    expect(css).toStrictEqual({
      '.gap-y-5': {
        rowGap: '20px',
      },
    });
  });
});
