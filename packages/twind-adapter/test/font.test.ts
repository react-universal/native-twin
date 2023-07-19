import { beforeEach, describe, expect, it } from 'vitest';
import { initialize } from '../src';

const stringify = (target: string[]) => target.join('');

const { tw, tx } = initialize({
  fontFamily: {
    DEFAULT: 'Inter-Regular',
    inter: 'Inter-Regular',
    'inter-bold': 'Inter-Bold',
    'inter-medium': 'Inter-Medium',
    sans: 'Inter-Regular',
  },
});

describe('TailwindCSS Font', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('font-size', () => {
    const classNames = tx('text-2xl');
    expect(classNames).toStrictEqual('text-2xl');
    expect(stringify(tw.target)).toStrictEqual('.text-2xl{font-size:1.5rem;line-height:2rem}');
  });

  it('font-family', () => {
    const classNames = tx('font-inter');
    expect(classNames).toStrictEqual('font-inter');
    expect(stringify(tw.target)).toStrictEqual('.font-inter{font-family:Inter-Regular}');
  });

  it('leading', () => {
    const classNames = tx('leading-5');
    expect(classNames).toStrictEqual('leading-5');
    expect(stringify(tw.target)).toStrictEqual('.leading-5{line-height:1.25rem}');
  });
});
