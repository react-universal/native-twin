import { createTailwind, createVirtualSheet } from '@universal-labs/native-twin';
import { describe, expect, it } from 'vitest';
import { presetTailwind } from '../src';

const tailwind = createTailwind(
  {
    mode: 'web',
    ignorelist: [],
    presets: [presetTailwind()],
  },
  createVirtualSheet(),
);

describe('@universal-labs/native-twin - TW call', () => {
  it('Insert rules', () => {
    const result = tailwind('px-2 p-10 mx-2.5 text(center 2xl) bg-blue-200 justify-center');
    expect(result).toStrictEqual([
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
      {
        className: 'p-10',
        declarations: [['padding', '2.5rem']],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
      {
        className: 'mx-2.5',
        declarations: [
          ['marginLeft', '0.625rem'],
          ['marginRight', '0.625rem'],
        ],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
      {
        className: 'text-center',
        declarations: [['textAlign', 'center']],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
      {
        className: 'text-2xl',
        declarations: [['fontSize', '1.5rem']],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
      {
        className: 'bg-blue-200',
        important: false,
        precedence: 805306368,
        selectors: [],
        declarations: [['backgroundColor', 'rgba(191,219,254,1)']],
      },
      {
        className: 'justify-center',
        declarations: [['justifyContent', 'center']],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
  });
});
