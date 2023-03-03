import { describe, expect, it } from 'vitest';
import { setup } from '../src';
import { nativePlugin } from '../src/plugins/tailwind';

const tw = setup({ content: ['__'], plugins: [nativePlugin] });

describe('TailwindCSS compiler', () => {
  it('Normal color', () => {
    const css = tw('bg-black');
    expect(css.JSS).toStrictEqual({
      '.bg-black': {
        backgroundColor: 'rgba(0,0,0,1)',
      },
    });
  });

  it('Color with opacity', () => {
    const css = tw('bg-black/50');
    expect(css.JSS).toStrictEqual({
      '.bg-black\\/50': {
        backgroundColor: 'rgba(0,0,0,0.5)',
      },
    });
  });

  it('Translations', () => {
    const css = tw('translate-x-8');
    expect(css.JSS).toStrictEqual({
      '.translate-x-8': {
        transform: 'translate(32px, 0) rotate(0) skewX(0) skewY(0) scaleX(1) scaleY(1)',
      },
    });
  });
});
