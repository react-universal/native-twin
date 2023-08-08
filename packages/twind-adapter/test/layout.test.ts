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

describe('TailwindCSS layout', () => {
  it('Width', () => {
    const css = parseAndInject('w-4');
    expect(css.generated).toStrictEqual('w-4');
    expect(stringify(css.target)).toStrictEqual('.w-4{width:1rem}');
  });

  it('Height', () => {
    const css = parseAndInject('h-4');
    expect(css.generated).toStrictEqual('h-4');
    expect(stringify(css.target)).toStrictEqual('.h-4{height:1rem}');
  });
});
