import { describe, expect, it } from 'vitest';
import { createVirtualSheet } from '../src/css/sheets';
import { createTailwind } from '../src/tailwind';

const tailwind = createTailwind(
  {
    ignorelist: [],
    theme: {
      extend: {
        colors: {
          primary: '#0558f9',
        },
      },
    },
  },
  createVirtualSheet(true),
);

describe('@universal-labs/native-tailwind - Spacing Utilities', () => {
  it('paddings', () => {
    expect(tailwind('p-2')).toStrictEqual([{ padding: 8 }]);
    expect(tailwind('px-2')).toStrictEqual([{ paddingLeft: 8, paddingRight: 8 }]);
    expect(tailwind('py-2')).toStrictEqual([{ paddingTop: 8, paddingBottom: 8 }]);
  });
  it('margins', () => {
    expect(tailwind('m-2')).toStrictEqual([{ margin: 8 }]);
    expect(tailwind('-m-2')).toStrictEqual([{ margin: -8 }]);
    expect(tailwind('mx-2')).toStrictEqual([{ marginLeft: 8, marginRight: 8 }]);
    expect(tailwind('my-2')).toStrictEqual([{ marginTop: 8, marginBottom: 8 }]);
  });
  it('arbitrary', () => {
    expect(tailwind('m-[20px]')).toStrictEqual([{ margin: '20px' }]);
    expect(tailwind('-mx-[20px]')).toStrictEqual([
      { marginLeft: '-20px', marginRight: '-20px' },
    ]);
    // expect(tailwind('bg-blue-200/10')).toStrictEqual([{ margin: '20px' }]);
  });
});

describe('@universal-labs/native-tailwind - Color Utilities', () => {
  it('Basic color', () => {
    expect(tailwind('bg-black')).toStrictEqual([{ backgroundColor: 'rgba(0,0,0,1)' }]);
  });
  it('Custom color', () => {
    expect(tailwind('bg-primary')).toStrictEqual([{ backgroundColor: 'rgba(5,88,249,1)' }]);
  });
  it('Opacity', () => {
    expect(tailwind('opacity-10')).toStrictEqual([{ opacity: '0.1' }]);
  });
  it('Color modifier', () => {
    expect(tailwind('bg-blue-200/[0.5]')).toStrictEqual([
      { backgroundColor: 'rgba(191,219,254,0.5)' },
    ]);
  });
});

describe('@universal-labs/native-tailwind - Position Utilities', () => {
  it('top|right|bottom|left', () => {
    expect(tailwind('top-2')).toStrictEqual([{ top: 8 }]);
  });
});

describe('@universal-labs/native-tailwind - Border Utilities', () => {
  it('t|r|b|l', () => {
    expect(tailwind('border-x-1')).toStrictEqual([
      { borderLeftWidth: 1, borderRightWidth: 1 },
    ]);
  });
});
