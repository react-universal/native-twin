import { describe, expect, it } from 'vitest';
import { createVirtualSheet } from '../src/css/sheets';
import { createTailwind } from '../src/tailwind';

const tailwind = createTailwind({ ignorelist: [] }, createVirtualSheet());

describe('@universal-labs/native-tailwind - TW call', () => {
  it('Insert rules', () => {
    const result = tailwind('px-2 p-10 mx-2.5 text(center 2xl) bg-blue-200 justify-center');
    expect(result.sheet.base).toStrictEqual({
      paddingLeft: 8,
      paddingRight: 8,
      padding: 40,
      marginLeft: 10,
      marginRight: 10,
      textAlign: 'center',
      fontSize: 24,
      backgroundColor: 'rgba(191,219,254,1)',
      justifyContent: 'center',
    });
  });
});
