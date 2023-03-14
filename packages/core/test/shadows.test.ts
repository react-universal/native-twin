import { describe, expect, it } from 'vitest';
import { setup } from '../src';
import { nativePlugin } from '../src/tailwind';

const tw = setup({ content: ['__'], plugins: [nativePlugin] });

describe('TailwindCSS Shadow', () => {
  it('Shadow', () => {
    const css = tw.style('shadow-md');
    expect(css.JSS).toStrictEqual({
      '.shadow-md': {
        boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.1)',
        elevation: '6',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
      },
    });
  });
});
