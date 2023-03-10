import { nativePlugin } from '@universal-labs/core/tailwind';
import { describe, expect, it } from 'vitest';
import { setup } from '../src';

const tw = setup({ content: ['__'], plugins: [nativePlugin] });

describe('TailwindCSS Shadow', () => {
  it('Shadow', () => {
    const css = tw('shadow-md');
    console.log('CSS: ', css);
    expect(css.JSS).toStrictEqual({});
  });
});
