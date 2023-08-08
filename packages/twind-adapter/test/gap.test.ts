import { describe, expect, it } from 'vitest';
import { Tailwind } from '../src';

const { parseAndInject } = new Tailwind({
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
  it('gap', () => {
    const classNames = parseAndInject('gap-5');
    expect(classNames.generated).toStrictEqual('gap-5');
    expect(stringify(classNames.target)).toStrictEqual('.gap-5{gap:1.25rem}');
  });

  it('gap-x', () => {
    const classNames = parseAndInject('gap-x-5');
    expect(classNames.generated).toStrictEqual('gap-x-5');
    expect(stringify(classNames.target)).toStrictEqual('.gap-x-5{column-gap:1.25rem}');
  });

  it('gap-y', () => {
    const classNames = parseAndInject('gap-y-5');
    expect(classNames.generated).toStrictEqual('gap-y-5');
    expect(stringify(classNames.target)).toStrictEqual('.gap-y-5{row-gap:1.25rem}');
  });
});
