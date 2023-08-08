import { describe, expect, it } from 'vitest';
import { Tailwind } from '../src';

const stringify = (target: string[]) => target.join('');

const { parseAndInject } = new Tailwind({
  fontFamily: {
    DEFAULT: 'Inter-Regular',
    inter: 'Inter-Regular',
    'inter-bold': 'Inter-Bold',
    'inter-medium': 'Inter-Medium',
    sans: 'Inter-Regular',
  },
});

describe('TailwindCSS Font', () => {
  it('font-size', () => {
    const classNames = parseAndInject('text-2xl');
    expect(classNames.generated).toStrictEqual('text-2xl');
    expect(stringify(classNames.target)).toStrictEqual(
      '.text-2xl{font-size:1.5rem;line-height:2rem}',
    );
  });

  it('font-family', () => {
    const classNames = parseAndInject('font-inter');
    expect(classNames.generated).toStrictEqual('font-inter');
    expect(stringify(classNames.target)).toStrictEqual(
      '.font-inter{font-family:Inter-Regular}',
    );
  });

  it('leading', () => {
    const classNames = parseAndInject('leading-5');
    expect(classNames.generated).toStrictEqual('leading-5');
    expect(stringify(classNames.target)).toStrictEqual('.leading-5{line-height:1.25rem}');
  });
});
