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
  createVirtualSheet(),
);

describe('@universal-labs/native-tailwind - Spacing Utilities', () => {
  it('paddings', () => {
    expect(tailwind('p-2')).toStrictEqual([
      {
        className: 'p-2',
        declarations: [['padding', '0.5rem']],
        group: 'base',
        rule: { n: 'p-2', v: [], i: false, m: null },
      },
    ]);
    expect(tailwind('px-2')).toStrictEqual([
      {
        className: 'px-2',
        declarations: [
          ['paddingLeft', '0.5rem'],
          ['paddingRight', '0.5rem'],
        ],
        group: 'base',
        rule: { n: 'px-2', v: [], i: false, m: null },
      },
    ]);
    expect(tailwind('py-2')).toStrictEqual([
      {
        className: 'py-2',
        declarations: [
          ['paddingTop', '0.5rem'],
          ['paddingBottom', '0.5rem'],
        ],
        group: 'base',
        rule: { n: 'py-2', v: [], i: false, m: null },
      },
    ]);
  });
  it('margins', () => {
    expect(tailwind('m-2')).toStrictEqual([
      {
        className: 'm-2',
        declarations: [['margin', '0.5rem']],
        group: 'base',
        rule: { n: 'm-2', v: [], i: false, m: null },
      },
    ]);
    expect(tailwind('-m-2')).toStrictEqual([
      {
        className: '-m-2',
        declarations: [['margin', '-0.5rem']],
        group: 'base',
        rule: { n: '-m-2', v: [], i: false, m: null },
      },
    ]);
    expect(tailwind('mx-2')).toStrictEqual([
      {
        className: 'mx-2',
        declarations: [
          ['marginLeft', '0.5rem'],
          ['marginRight', '0.5rem'],
        ],
        group: 'base',
        rule: { n: 'mx-2', v: [], i: false, m: null },
      },
    ]);
    expect(tailwind('my-2')).toStrictEqual([
      {
        className: 'my-2',
        declarations: [
          ['marginTop', '0.5rem'],
          ['marginBottom', '0.5rem'],
        ],
        group: 'base',
        rule: { n: 'my-2', v: [], i: false, m: null },
      },
    ]);
  });
  it('arbitrary', () => {
    expect(tailwind('m-[20px]')).toStrictEqual([
      {
        className: 'm-[20px]',
        declarations: [['margin', '20px']],
        group: 'base',
        rule: { n: 'm-[20px]', v: [], i: false, m: null },
      },
    ]);
    expect(tailwind('-mx-[20px]')).toStrictEqual([
      {
        className: '-mx-[20px]',
        declarations: [
          ['marginLeft', '-20px'],
          ['marginRight', '-20px'],
        ],
        group: 'base',
        rule: { n: '-mx-[20px]', v: [], i: false, m: null },
      },
    ]);
  });
});

describe('@universal-labs/native-tailwind - Color Utilities', () => {
  it('Basic color', () => {
    expect(tailwind('bg-black')).toStrictEqual([
      {
        className: 'bg-black',
        group: 'base',
        rule: { n: 'bg-black', v: [], i: false, m: null },
        declarations: [['backgroundColor', 'rgba(0,0,0,1)']],
      },
    ]);
  });
  it('Custom color', () => {
    expect(tailwind('bg-primary')).toStrictEqual([
      {
        className: 'bg-primary',
        group: 'base',
        rule: { n: 'bg-primary', v: [], i: false, m: null },
        declarations: [['backgroundColor', 'rgba(5,88,249,1)']],
      },
    ]);
  });
  it('Opacity', () => {
    expect(tailwind('opacity-10')).toStrictEqual([
      {
        className: 'opacity-10',
        declarations: [['opacity', '0.1']],
        group: 'base',
        rule: { n: 'opacity-10', v: [], i: false, m: null },
      },
    ]);
  });
  it('Color modifier', () => {
    expect(tailwind('bg-blue-200/[0.5]')).toStrictEqual([
      {
        className: 'bg-blue-200/[0.5]',
        group: 'base',
        rule: {
          n: 'bg-blue-200',
          v: [],
          i: false,
          m: { type: 'COLOR_MODIFIER', value: '[0.5]' },
        },
        declarations: [['backgroundColor', 'rgba(191,219,254,0.5)']],
      },
    ]);
  });
});

describe('@universal-labs/native-tailwind - Position Utilities', () => {
  it('top|right|bottom|left', () => {
    expect(tailwind('top-2')).toStrictEqual([
      {
        className: 'top-2',
        declarations: [['top', '0.5rem']],
        group: 'base',
        rule: { n: 'top-2', v: [], i: false, m: null },
      },
    ]);
  });
});

describe('@universal-labs/native-tailwind - Border Utilities', () => {
  it('t|r|b|l', () => {
    expect(tailwind('border-x-1')).toStrictEqual([
      {
        className: 'border-x-1',
        declarations: [
          ['borderLeftWidth', '1px'],
          ['borderRightWidth', '1px'],
        ],
        group: 'base',
        rule: { n: 'border-x-1', v: [], i: false, m: null },
      },
    ]);
  });
});
