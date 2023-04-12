import { describe, expect, it } from 'vitest';
import { setup } from '../src';
import { reactNativeTailwindPreset } from '../src/tailwind/preset/tailwind-preset';

const tw = setup({ content: ['__'], presets: [reactNativeTailwindPreset()] });

describe('TailwindCSS platform variants (web)', () => {
  it('Shadow', () => {
    const css = tw('web:rounded-xl ios:rounded-sm');
    expect(css).toStrictEqual({
      '@media ios': {
        '.ios\\:rounded-sm': {
          borderRadius: '2px',
        },
      },
      '@media web': {
        '.web\\:rounded-xl': {
          borderRadius: '12px',
        },
      },
    });
  });
});
