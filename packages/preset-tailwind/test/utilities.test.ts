import { createVirtualSheet } from '@universal-labs/css';
import { createTailwind } from '@universal-labs/native-twin';
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

describe('@universal-labs/preset-tailwind - Spacing Utilities', () => {
  it('paddings', () => {
    expect(tailwind('p-2')).toStrictEqual([
      {
        className: 'p-2',
        declarations: [
          {
            prop: 'padding',
            value: '0.5rem',
          },
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
    expect(tailwind('px-2')).toStrictEqual([
      {
        className: 'px-2',
        declarations: [
          { prop: 'paddingLeft', value: '0.5rem' },
          { prop: 'paddingRight', value: '0.5rem' },
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
    expect(tailwind('absolute')).toStrictEqual([
      {
        className: 'absolute',
        declarations: [{ prop: 'position', value: 'absolute' }],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
    expect(tailwind('py-2')).toStrictEqual([
      {
        className: 'py-2',
        declarations: [
          { prop: 'paddingTop', value: '0.5rem' },
          { prop: 'paddingBottom', value: '0.5rem' },
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
        declarations: [
          {
            prop: 'margin',
            value: '0.5rem',
          },
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
    expect(tailwind('-m-2')).toStrictEqual([
      {
        className: '-m-2',
        declarations: [
          {
            prop: 'margin',
            value: '-0.5rem',
          },
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
    expect(tailwind('mx-2')).toStrictEqual([
      {
        className: 'mx-2',
        declarations: [
          { prop: 'marginLeft', value: '0.5rem' },
          { prop: 'marginRight', value: '0.5rem' },
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
          {
            prop: 'marginTop',
            value: '0.5rem',
          },
          {
            prop: 'marginBottom',
            value: '0.5rem',
          },
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
        declarations: [
          {
            prop: 'margin',
            value: '20px',
          },
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
    expect(tailwind('-mx-[20px]')).toStrictEqual([
      {
        className: '-mx-[20px]',
        declarations: [
          {
            prop: 'marginLeft',
            value: '-20px',
          },
          {
            prop: 'marginRight',
            value: '-20px',
          },
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
        declarations: [
          {
            prop: 'backgroundColor',
            value: 'rgba(0,0,0,1)',
          },
        ],
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
        declarations: [
          {
            prop: 'backgroundColor',
            value: 'rgba(5,88,249,1)',
          },
        ],
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
        declarations: [
          {
            prop: 'opacity',
            value: '0.1',
          },
        ],
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
        declarations: [
          {
            prop: 'backgroundColor',
            value: 'rgba(191,219,254,0.5)',
          },
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
  });
});

describe('@universal-labs/preset-tailwind - Position Utilities', () => {
  it('top|right|bottom|left', () => {
    expect(tailwind('top-2')).toStrictEqual([
      {
        className: 'top-2',
        declarations: [
          {
            prop: 'top',
            value: '0.5rem',
          },
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
  });
});

describe('@universal-labs/preset-tailwind - Border Utilities', () => {
  it('t|r|b|l', () => {
    expect(tailwind('border-x-1')).toStrictEqual([
      {
        className: 'border-x-1',
        declarations: [
          { prop: 'borderLeftWidth', value: '1px' },
          { prop: 'borderRightWidth', value: '1px' },
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
  });
});
