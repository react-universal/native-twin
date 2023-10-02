import { createTailwind, createVirtualSheet } from '@universal-labs/native-twin';
import { describe, expect, it } from 'vitest';
import { presetTailwind } from '../src';

const tailwind = createTailwind(
  { ignorelist: [], presets: [presetTailwind()] },
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
        group: 'base',
        rule: { n: 'px-2', v: [], i: false, m: null },
      },
      {
        className: 'p-10',
        declarations: [['padding', '2.5rem']],
        group: 'base',
        rule: { n: 'p-10', v: [], i: false, m: null },
      },
      {
        className: 'mx-2.5',
        declarations: [
          ['marginLeft', '0.625rem'],
          ['marginRight', '0.625rem'],
        ],
        group: 'base',
        rule: { n: 'mx-2.5', v: [], i: false, m: null },
      },
      {
        className: 'text-center',
        declarations: [['textAlign', 'center']],
        group: 'base',
        rule: { n: 'text-center', v: [], i: false, m: null },
      },
      {
        className: 'text-2xl',
        declarations: [['fontSize', '1.5rem']],
        group: 'base',
        rule: { n: 'text-2xl', v: [], i: false, m: null },
      },
      {
        className: 'bg-blue-200',
        group: 'base',
        rule: { n: 'bg-blue-200', v: [], i: false, m: null },
        declarations: [['backgroundColor', 'rgba(191,219,254,1)']],
      },
      {
        className: 'justify-center',
        declarations: [['justifyContent', 'center']],
        group: 'base',
        rule: { n: 'justify-center', v: [], i: false, m: null },
      },
    ]);
  });
});
