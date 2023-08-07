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

describe('TailwindCSS platform variants (web)', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('Shadow', () => {
    const classNames = tx('web:rounded-xl ios:rounded-sm');
    expect(classNames).toStrictEqual('ios:rounded-sm web:rounded-xl');
    expect(stringify(tw.target)).toBeDefined();
  });
});
