import { describe, expect, it } from 'vitest';
import { setup } from '../src';
import { nativePlugin } from '../src/tailwind';

const tw = setup({ content: ['__'], plugins: [nativePlugin] });

describe('TailwindCSS Shadow', () => {
  it('Shadow', () => {
    const css = tw.style('gap-5');
    expect(css.JSS).toStrictEqual({
      '.gap-5': {
        gap: '20px',
      },
    });
  });
});
