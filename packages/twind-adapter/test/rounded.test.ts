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

describe('TailwindCSS rounded', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('Shadow', () => {
    const className = tx('rounded-xl');
    expect(className).toStrictEqual('rounded-xl');
    expect(stringify(tw.target)).toStrictEqual('.rounded-xl{border-radius:0.75rem}');
  });
});
