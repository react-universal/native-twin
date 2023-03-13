import { describe, expect, it } from 'vitest';
import { setup } from '../src';
import { nativePlugin } from '../src/tailwind';

const tw = setup({ content: ['__'], plugins: [nativePlugin] });

describe('TailwindCSS Shadow', () => {
  it('Shadow', () => {
    const css = tw('gap-5');
    console.log('CSS: ', css);
    expect(css.JSS).toStrictEqual({});
  });
});
