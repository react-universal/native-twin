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

describe('TailwindCSS Aspect Ratio', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('aspect-square', () => {
    const classNames = tx('aspect-square');
    expect(classNames).toStrictEqual('aspect-square');
    expect(stringify(tw.target)).toStrictEqual('.aspect-square{aspect-ratio:1/1}');
  });

  it('aspect-video', () => {
    const classNames = tx('aspect-video');
    expect(classNames).toStrictEqual('aspect-video');
    expect(stringify(tw.target)).toStrictEqual('.aspect-video{aspect-ratio:16/9}');
  });

  it('aspect-auto', () => {
    const classNames = tx('aspect-auto');
    expect(classNames).toStrictEqual('aspect-auto');
    expect(stringify(tw.target)).toStrictEqual('.aspect-auto{aspect-ratio:auto}');
  });
});
