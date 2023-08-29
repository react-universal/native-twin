import { describe, expect, it } from 'vitest';
import { createTailwind } from '../src/tailwind';
import { virtual } from '../src/css/sheets';

const tailwind = createTailwind({ ignorelist: [] }, virtual(true));

describe('@universal-labs/native-tailwind - TW call', () => {
  it('Insert rules', () => {
    const result = tailwind('px-2 text(center) bg-blue-200 justify-center');
    expect(result).toStrictEqual([
      { 'padding-left': '0.5rem', 'padding-right': '0.5rem' },
      { 'text-align': 'center' },
      { 'background-color': '#bfdbfe' },
      { 'justify-items': 'center' },
    ]);
  });
});
