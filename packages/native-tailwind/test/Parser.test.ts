import { describe, expect, it } from 'vitest';
import { parseRawRules, parsedRuleToString } from '../src/parsers/class-names';

const screens = ['md', 'sm', 'lg', 'xl', '2xl'];

describe('@universal-labs/native-tailwind - Raw rules parser', () => {
  it('Parse regular rules', () => {
    const result = parseRawRules('bg-blue-300 xl:bg-white hover:text-2xl');
    expect(result).toStrictEqual([
      {
        n: 'bg-blue-300',
        v: [],
        i: false,
      },
      {
        n: 'bg-white',
        v: ['xl'],
        i: false,
      },
      {
        n: 'text-2xl',
        v: ['hover'],
        i: false,
      },
    ]);
  });
  it('Parse grouped rules', () => {
    const result = parseRawRules('hover:focus:(bg-pink-200)');
    expect(result).toStrictEqual([
      {
        n: 'bg-pink-200',
        v: ['hover', 'focus'],
        i: false,
      },
    ]);
  });
  it('Parse nested grouped rules', () => {
    const result = parseRawRules('md:(!bg-black !sm:(bg-blue-200 h-24))');
    const classNames = result.map((x) => parsedRuleToString(x, screens));
    expect(classNames).toStrictEqual(['.md:!bg-black', '.md:sm:!bg-blue-200', '.md:sm:!h-24']);
    expect(result).toStrictEqual([
      { n: 'bg-black', v: ['md'], i: true },
      { n: 'bg-blue-200', v: ['md', 'sm'], i: true },
      { n: 'h-24', v: ['md', 'sm'], i: true },
    ]);
  });
});
