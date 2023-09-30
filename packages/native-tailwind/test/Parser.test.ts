import { parseTWTokens } from '@universal-labs/css';
import { describe, expect, it } from 'vitest';
import { toClassName } from '../src/utils/string-utils';

describe('@universal-labs/native-tw - Raw rules parser', () => {
  it('Parse regular rules', () => {
    const result = parseTWTokens('bg-blue-300 xl:bg-white hover:text-2xl');
    expect(result).toStrictEqual([
      {
        n: 'bg-blue-300',
        v: [],
        i: false,
        m: null,
      },
      {
        n: 'bg-white',
        v: ['xl'],
        i: false,
        m: null,
      },
      {
        n: 'text-2xl',
        v: ['hover'],
        i: false,
        m: null,
      },
    ]);
  });
  it('Parse grouped rules', () => {
    const result = parseTWTokens('hover:focus:(bg-pink-200)');
    expect(result).toStrictEqual([
      {
        n: 'bg-pink-200',
        v: ['hover', 'focus'],
        i: false,
        m: null,
      },
    ]);
  });
  it('Parse nested grouped rules', () => {
    const result = parseTWTokens('md:(!bg-black !sm:(bg-blue-200 h-24))');
    const classNames = result.map((x) => toClassName(x));
    expect(classNames).toStrictEqual(['md:!bg-black', 'sm:md:!bg-blue-200', 'sm:md:!h-24']);
    expect(result).toStrictEqual([
      { n: 'bg-black', v: ['md'], i: true, m: null },
      { n: 'bg-blue-200', v: ['sm', 'md'], i: true, m: null },
      { n: 'h-24', v: ['sm', 'md'], i: true, m: null },
    ]);
  });
});
