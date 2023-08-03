import { beforeEach, describe, expect, it } from 'vitest';
import { Tailwind } from '../src';

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
const stringify = (target: string[]) => target.join('');

describe('TailwindCSS GAP', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('gap', () => {
    const classNames = tx('gap-5');
    expect(classNames).toStrictEqual('gap-5');
    expect(stringify(tw.target)).toStrictEqual('.gap-5{gap:1.25rem}');
  });

  it('gap-x', () => {
    const classNames = tx('gap-x-5');
    expect(classNames).toStrictEqual('gap-x-5');
    expect(stringify(tw.target)).toStrictEqual('.gap-x-5{column-gap:1.25rem}');
  });

  it('gap-y', () => {
    const classNames = tx('gap-y-5');
    expect(classNames).toStrictEqual('gap-y-5');
    expect(stringify(tw.target)).toStrictEqual('.gap-y-5{row-gap:1.25rem}');
  });
});
