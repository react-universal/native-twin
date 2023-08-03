import { beforeEach, describe, expect, it } from 'vitest';
import { Tailwind } from '../src';

const stringify = (target: string[]) => target.join('');

const {
  instance: { tw, tx },
} = new Tailwind({
  fontFamily: {
    DEFAULT: 'Inter-Regular',
    inter: 'Inter-Regular',
    'inter-bold': 'Inter-Bold',
    'inter-medium': 'Inter-Medium',
    sans: 'Inter-Regular',
  },
});

describe('TailwindCSS layout', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('Width', () => {
    const css = tx('w-4');
    expect(css).toStrictEqual('w-4');
    expect(stringify(tw.target)).toStrictEqual('.w-4{width:1rem}');
  });

  it('Height', () => {
    const css = tx('h-4');
    expect(css).toStrictEqual('h-4');
    expect(stringify(tw.target)).toStrictEqual('.h-4{height:1rem}');
  });
});
