import { describe, expect, it } from 'vitest';
import { setup } from '../src';
import { nativePlugin } from '../src/tailwind';

const tw = setup({ content: ['__'], plugins: [nativePlugin] });

describe('TailwindCSS compiler', () => {
  it('Normal color', () => {
    const css = tw('bg-black');
    expect(css.JSS).toStrictEqual({
      '.bg-black': {
        backgroundColor: '#000',
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
        transform: 'translate(32px)',
      },
    });
  });
});
