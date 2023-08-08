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

describe('TailwindCSS platform variants (web)', () => {
  it('Shadow', () => {
    const classNames = parseAndInject('web:rounded-xl ios:rounded-sm');
    expect(classNames.generated).toStrictEqual('ios:rounded-sm web:rounded-xl');
    expect(stringify(classNames.target)).toBeDefined();
  });
});
