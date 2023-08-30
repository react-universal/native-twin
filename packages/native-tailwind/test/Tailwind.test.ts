import { describe, expect, it } from 'vitest';
import { createTailwind } from '../src/tailwind';
import { virtual } from '../src/css/sheets';

const tailwind = createTailwind({ ignorelist: [] }, virtual(true));

describe('@universal-labs/native-tailwind - TW call', () => {
  it('Insert rules', () => {
    const result = tailwind('px-2 p-10 mx-2.5 text(center 2xl) bg-blue-200 justify-center');
    expect(result).toStrictEqual([
      { 'padding-left': '0.5rem', 'padding-right': '0.5rem' },
      { padding: '2.5rem' },
      { 'margin-left': '0.625rem', 'margin-right': '0.625rem' },
      { 'text-align': 'center' },
      { 'font-size': '1.5rem', 'line-height': '2rem' },
      { 'background-color': '#bfdbfe' },
      { 'justify-items': 'center' },
    ]);
  });
});
