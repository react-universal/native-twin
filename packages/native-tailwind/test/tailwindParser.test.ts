import { describe, expect, it } from 'vitest';
import { setup } from '../src';

const tw = setup({ content: ['__'] });

describe('TailwindCSS compiler', () => {
  it('Normal color', () => {
    const css = tw('bg-black');
    console.log('CSS: ', css);
    expect(css.JSS).toStrictEqual({
      '.bg-black': {
        backgroundColor: 'rgba(0,0,0,1)',
      },
    });
  });

  it('Color with opacity', () => {
    const css = tw('bg-black/50');
    console.log('CSS: ', css);
    expect(css.JSS).toStrictEqual({
      '.bg-black\\/50': {
        backgroundColor: 'rgba(0,0,0,0.5)',
      },
    });
  });
});
