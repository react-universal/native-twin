/* eslint-disable no-console */
import util from 'util';
import { describe, expect, it } from 'vitest';
import { cssParser } from '../src/css/css.parser';

const tokenizer = cssParser();

describe('@universal-labs/stylesheets', () => {
  it('Parse CSS Rule', () => {
    const ast = tokenizer(
      'text-2xl translate-x-2 hover:text-red-500 first:bg-gray-100 flex-1',
    );
    console.log('AST: ', util.inspect(ast, false, null, true /* enable colors */));

    expect(ast).toStrictEqual({
      base: {
        fontSize: 24,
        lineHeight: 32,
        transform: [{ translateX: 32 }, { translateY: 0 }],
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
      },
      even: {},
      first: {
        backgroundColor: 'rgba(243,244,246,1)',
      },
      group: {},
      last: {},
      odd: {},
      pointer: { color: 'rgba(239,68,68,1)' },
      isGroupParent: false,
    });
  });
});
