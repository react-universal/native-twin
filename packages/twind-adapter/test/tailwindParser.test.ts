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

describe('TailwindCSS compiler', () => {
  it('Normal color', () => {
    const className = parseAndInject('bg-black');
    expect(className.generated).toStrictEqual('bg-black');
    expect(stringify(className.target)).toStrictEqual(
      '.bg-black{background-color:rgba(0,0,0,1);}',
    );
  });

  it('Color with opacity', () => {
    const className = parseAndInject('bg-black/50');
    expect(className.generated).toStrictEqual('bg-black/50');
    expect(stringify(className.target)).toStrictEqual(
      '.bg-black\\/50{background-color:rgba(0,0,0,0.5);}',
    );
  });

  it('Translations', () => {
    const className = parseAndInject('translate-x-8');
    expect(className.generated).toStrictEqual('translate-x-8');
    expect(stringify(className.target)).toStrictEqual(
      '.translate-x-8{transform:translate(2rem)}',
    );
  });
});
