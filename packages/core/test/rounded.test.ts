import { describe, expect, it } from 'vitest';
import { setup } from '../src';
import nativePreset from '../src/tailwind/preset/tailwind-preset';

const tw = setup({ content: ['__'], presets: [nativePreset()] });

describe('TailwindCSS rounded', () => {
  it('Shadow', () => {
    const css = tw.style('rounded-xl');
    expect(css.JSS).toStrictEqual({
      '.rounded-xl': {
        borderRadius: '12px',
      },
    });
  });
});
