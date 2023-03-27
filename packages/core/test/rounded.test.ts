import { describe, expect, it } from 'vitest';
import { setup } from '../src';
import { reactNativeTailwindPreset } from '../src/tailwind/preset/tailwind-preset';

const tw = setup({ content: ['__'], presets: [reactNativeTailwindPreset()] });

describe('TailwindCSS rounded', () => {
  it('Shadow', () => {
    const css = tw.css('rounded-xl');
    expect(css.JSS).toStrictEqual({
      '.rounded-xl': {
        borderRadius: '12px',
      },
    });
  });
});
