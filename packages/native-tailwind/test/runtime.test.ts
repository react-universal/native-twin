import { describe, expect, it } from 'vitest';
import { createTailwind, setup, tx } from '../src';

setup(createTailwind({}));

describe('@universal-labs/native-tw - TW call', () => {
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
        group: 'base',
        rule: { n: 'px-2', v: [], i: false, m: null },
      },
      {
        className: 'm-10',
        declarations: [['margin', '2.5rem']],
        group: 'base',
        rule: { n: 'm-10', v: [], i: false, m: null },
      },
      {
        className: 'text-2xl',
        declarations: [['fontSize', '1.5rem']],
        group: 'base',
        rule: { n: 'text-2xl', v: [], i: false, m: null },
      },
      {
        className: 'text-indigo-200',
        group: 'base',
        rule: { n: 'text-indigo-200', v: [], i: false, m: null },
        declarations: [['color', 'rgba(199,210,254,1)']],
      },
    ]);
  });
});
