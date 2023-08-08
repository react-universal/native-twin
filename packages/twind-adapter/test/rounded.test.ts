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

describe('TailwindCSS rounded', () => {
  it('Shadow', () => {
    const className = parseAndInject('rounded-xl');
    expect(className.generated).toStrictEqual('rounded-xl');
    expect(stringify(className.target)).toStrictEqual('.rounded-xl{border-radius:0.75rem}');
  });
});
