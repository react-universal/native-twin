/* eslint-disable no-console */
import util from 'util';
import { describe, expect, it } from 'vitest';
import { lexer } from '../src/css/Lexer';

describe('@universal-labs/stylesheets', () => {
  it('CSS to AST', () => {
    lexer.injectClassNames(
      'text-2xl translate-x-2 hover:text-red-500 first:bg-gray-100 flex-1',
    );
    const ast = [...lexer.parse()];

    console.log('AST: ', util.inspect(ast, false, null, true /* enable colors */));

    expect(ast).toStrictEqual([
      {
        selector: '.translate-x-2',
        declarations: { transform: [{ translateX: 32 }, { translateY: 0 }] },
      },
      {
        selector: '.flex-1',
        declarations: { flexGrow: 1, flexShrink: 1, flexBasis: '0%' },
      },
      {
        selector: '.text-2xl',
        declarations: { fontSize: 24, lineHeight: 32 },
      },
      {
        selector: '.first\\:bg-gray-100:first-child',
        declarations: { backgroundColor: 'rgba(243,244,246,1)' },
      },
      {
        selector: '.hover\\:text-red-500:hover',
        declarations: { color: 'rgba(239,68,68,1)' },
      },
    ]);
  });
});
