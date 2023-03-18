import { describe, expect, it } from 'vitest';
import { setup } from '../src';
import { reactNativeTailwindPreset } from '../src/tailwind/preset/tailwind-preset';

const tw = setup({ content: ['__'], presets: [reactNativeTailwindPreset()] });

describe('TailwindCSS Shadow', () => {
  it('Shadow', () => {
    const css = tw.style('shadow-md');
    expect(css.JSS).toStrictEqual({
      '.shadow-md': {
        boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.1)',
        elevation: '6',
      },
    });
  });
});
