import { createTailwind, createVirtualSheet } from '@universal-labs/native-twin';
import { describe, expect, it } from 'vitest';
import { presetTailwind } from '../src';

const tailwind = createTailwind(
  {
    mode: 'web',
    presets: [presetTailwind()],
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

describe('@universal-labs/native-twin - Spacing Utilities', () => {
  it('paddings', () => {
    expect(tailwind('p-2')).toStrictEqual([
      {
        className: 'p-2',
        declarations: [['padding', '0.5rem']],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
    expect(tailwind('px-2')).toStrictEqual([
      {
        className: 'px-2',
        declarations: [
          ['paddingLeft', '0.5rem'],
          ['paddingRight', '0.5rem'],
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
    expect(tailwind('py-2')).toStrictEqual([
      {
        className: 'py-2',
        declarations: [
          ['paddingTop', '0.5rem'],
          ['paddingBottom', '0.5rem'],
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
  });
  it('margins', () => {
    expect(tailwind('m-2')).toStrictEqual([
      {
        className: 'm-2',
        declarations: [['margin', '0.5rem']],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
    expect(tailwind('-m-2')).toStrictEqual([
      {
        className: '-m-2',
        declarations: [['margin', '-0.5rem']],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
    expect(tailwind('mx-2')).toStrictEqual([
      {
        className: 'mx-2',
        declarations: [
          ['marginLeft', '0.5rem'],
          ['marginRight', '0.5rem'],
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
    expect(tailwind('my-2')).toStrictEqual([
      {
        className: 'my-2',
        declarations: [
          ['marginTop', '0.5rem'],
          ['marginBottom', '0.5rem'],
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
  });
  it('arbitrary', () => {
    expect(tailwind('m-[20px]')).toStrictEqual([
      {
        className: 'm-[20px]',
        declarations: [['margin', '20px']],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
    expect(tailwind('-mx-[20px]')).toStrictEqual([
      {
        className: '-mx-[20px]',
        declarations: [
          ['marginLeft', '-20px'],
          ['marginRight', '-20px'],
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
  });
});

describe('@universal-labs/native-twin - Color Utilities', () => {
  it('Basic color', () => {
    expect(tailwind('bg-black')).toStrictEqual([
      {
        className: 'bg-black',
        declarations: [['backgroundColor', 'rgba(0,0,0,1)']],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
  });
  it('Custom color', () => {
    expect(tailwind('bg-primary')).toStrictEqual([
      {
        className: 'bg-primary',
        declarations: [['backgroundColor', 'rgba(5,88,249,1)']],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
  });
  it('Opacity', () => {
    expect(tailwind('opacity-10')).toStrictEqual([
      {
        className: 'opacity-10',
        declarations: [['opacity', '0.1']],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
  });
  it('Color modifier', () => {
    expect(tailwind('bg-blue-200/[0.5]')).toStrictEqual([
      {
        className: 'bg-blue-200/[0.5]',
        declarations: [['backgroundColor', 'rgba(191,219,254,0.5)']],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
  });
});

describe('@universal-labs/native-twin - Position Utilities', () => {
  it('top|right|bottom|left', () => {
    expect(tailwind('top-2')).toStrictEqual([
      {
        className: 'top-2',
        declarations: [['top', '0.5rem']],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
  });
});

describe('@universal-labs/native-twin - Border Utilities', () => {
  it('t|r|b|l', () => {
    expect(tailwind('border-x-1')).toStrictEqual([
      {
        className: 'border-x-1',
        declarations: [
          ['borderLeftWidth', '1px'],
          ['borderRightWidth', '1px'],
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
  });
});
