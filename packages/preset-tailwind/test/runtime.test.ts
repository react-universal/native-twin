import { defineConfig, setup, tx } from '@universal-labs/native-twin';
import { describe, expect, it } from 'vitest';
import { presetTailwind } from '../src';

setup(
  defineConfig({
    mode: 'web',
    presets: [presetTailwind()],
    theme: {
      extend: {
        fontFamily: {
          inter: 'Inter',
        },
      },
    },
  }),
);

describe('@universal-labs/native-twin - TW call', () => {
  it('Insert rules', () => {
    const result = tx`
    px-2 m-10 
    text(2xl indigo-200)
  `;
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
        className: 'm-10',
        declarations: [['margin', '2.5rem']],
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
        className: 'text-indigo-200',
        declarations: [['color', 'rgba(199,210,254,1)']],
        important: false,
        precedence: 805306368,
        selectors: [],
      },
    ]);
  });
});
