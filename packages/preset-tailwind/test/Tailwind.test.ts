import { createVirtualSheet } from '@native-twin/css';
import { createTailwind } from '@native-twin/native-twin';
import { presetTailwind } from '../src';

const tailwind = createTailwind(
  {
    content: [],
    mode: 'web',
    ignorelist: [],
    presets: [presetTailwind()],
  },
  createVirtualSheet(),
);

describe('@native-twin/preset-tailwind - TW call', () => {
  it('Insert rules', () => {
    const result = tailwind('px-2 p-10 mx-2.5 text(center 2xl) bg-blue-200 justify-center');
    expect(result).toStrictEqual([
      {
        className: 'px-2',
        declarations: [
          {
            prop: 'paddingLeft',
            value: '0.5rem',
          },
          {
            prop: 'paddingRight',
            value: '0.5rem',
          },
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
      {
        className: 'p-10',
        declarations: [
          {
            prop: 'padding',
            value: '2.5rem',
          },
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
      {
        className: 'mx-2.5',
        declarations: [
          {
            prop: 'marginLeft',
            value: '0.625rem',
          },
          {
            prop: 'marginRight',
            value: '0.625rem',
          },
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
      {
        className: 'text-center',
        declarations: [
          {
            prop: 'textAlign',
            value: 'center',
          },
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
      {
        className: 'text-2xl',
        declarations: [
          {
            prop: 'fontSize',
            value: '1.5rem',
          },
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
      {
        className: 'bg-blue-200',
        important: false,
        precedence: 805306368,
        selectors: [],
        declarations: [
          {
            prop: 'backgroundColor',
            value: 'rgba(191,219,254,1)',
          },
        ],
      },
      {
        className: 'justify-center',
        declarations: [
          {
            prop: 'justifyContent',
            value: 'center',
          },
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
  });
});
