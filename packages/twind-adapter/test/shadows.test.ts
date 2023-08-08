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

describe('TailwindCSS Shadow', () => {
  it('Shadow', () => {
    const tw = parseAndInject('shadow-md');
    expect(tw.target).toStrictEqual([
      '.shadow-md{box-shadow:0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)}',
    ]);
  });

  it('Shadow', () => {
    const tw = parseAndInject('ring-1');
    expect(tw.target).toStrictEqual(['.ring-1{border:1px;margin:-1px}']);
  });
});
