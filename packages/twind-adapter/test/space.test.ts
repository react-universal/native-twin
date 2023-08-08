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

describe('TailwindCSS Space', () => {
  it('Margin', () => {
    const className = parseAndInject('m-2');
    expect(className.generated).toStrictEqual('m-2');
    expect(stringify(className.target)).toStrictEqual('.m-2{margin:0.5rem}');
  });

  it('Margin Top', () => {
    const className = parseAndInject('mt-2');
    expect(className.generated).toStrictEqual('mt-2');
    expect(stringify(className.target)).toStrictEqual('.mt-2{margin-top:0.5rem}');
  });

  it('Space X', () => {
    const className = parseAndInject('space-y-2');
    expect(className.generated).toStrictEqual('space-y-2');
    expect(stringify(className.target)).toStrictEqual(
      '.space-y-2>:not([hidden])~:not([hidden]){margin-top:calc(0.5rem * calc(1 - 0));}',
    );
  });

  it('Divide X', () => {
    const className = parseAndInject('divide-x-2');
    expect(className.generated).toStrictEqual('divide-x-2');
    expect(stringify(className.target)).toStrictEqual(
      '.divide-x-2>:not([hidden])~:not([hidden]){border-left-width:calc(2px * calc(1 - 0));}',
    );
  });
});
