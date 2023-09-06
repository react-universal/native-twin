import { describe, expect, it } from 'vitest';
import { createTailwind } from '../src/tailwind';
import { createVirtualSheet } from '../src/css/sheets';

const tailwind = createTailwind({ ignorelist: [] }, createVirtualSheet(true));

describe('@universal-labs/native-tailwind - TW call', () => {
  it('Insert rules', () => {
    const result = tailwind('px-2 p-10 mx-2.5 text(center 2xl) bg-blue-200 justify-center');
    expect(result).toStrictEqual([
      { paddingLeft: '0.5rem', paddingRight: '0.5rem' },
      { padding: '2.5rem' },
      { marginLeft: '0.625rem', marginRight: '0.625rem' },
      { textAlign: 'center' },
      { fontSize: '1.5rem', lineHeight: '2rem' },
      { backgroundColor: 'rgba(191,219,254,1)' },
      { justifyContent: 'center' },
    ]);
  });
});
