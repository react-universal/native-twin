/* eslint-disable no-console */
import clsx from 'clsx';
import util from 'util';
import { describe, expect, it } from 'vitest';
import { lexer } from '../src/css/Lexer';

describe('@universal-labs/stylesheets', () => {
  it('CSS to AST', () => {
    const result = lexer.classNamesToCss(clsx('text-2xl translate-x-2 flex-1'));

    console.log('AST_MEDIA: ', util.inspect(result, false, null, true /* enable colors */));

    expect(result).toEqual({
      ast: {
        base: {
          transform: [{ translateX: 8 }, { translateY: 0 }],
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: '0%',
          fontSize: 24,
          lineHeight: 32,
        },
        pointer: {},
        group: {},
        first: {},
        last: {},
        even: {},
        odd: {},
      },
      isGroupParent: false,
    });
  });

  it('CSS Media Rules to AST', () => {
    const result = lexer.classNamesToCss(
      clsx('flex-1 bg-gray-800', 'sm:bg-white', 'hover:bg-black'),
    );

    console.log('AST_MEDIA: ', util.inspect(result, false, null, true /* enable colors */));

    expect(result).toEqual({
      ast: {
        base: {
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: '0%',
          backgroundColor: 'rgba(255,255,255,1)',
        },
        pointer: { backgroundColor: 'rgba(0,0,0,1)' },
        group: {},
        first: {},
        last: {},
        even: {},
        odd: {},
      },
      isGroupParent: false,
    });
  });
});
