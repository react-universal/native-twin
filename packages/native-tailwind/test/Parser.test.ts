import { describe, expect, it } from 'vitest';
import { parseRawRules } from '../src/parsers';

describe('@universal-labs/native-tailwind - Raw rules parser', () => {
  it('Parse regular rules', () => {
    const result = parseRawRules('bg-blue-300 xl:bg-white hover:text-2xl');
    expect(result).toStrictEqual(['.bg-blue-300', '.xl:bg-white', '.hover:text-2xl']);
  });
  it('Parse grouped rules', () => {
    const result = parseRawRules('hover:focus:(bg-pink-200)');
    expect(result).toStrictEqual(['.hover:focus:bg-pink-200']);
  });
  it('Parse nested grouped rules', () => {
    const result = parseRawRules('md:(!bg-black sm:(bg-blue-200 h-24))');
    expect(result).toStrictEqual(['.md:!bg-black', '.sm:bg-blue-200', '.sm:h-24']);
  });
});
