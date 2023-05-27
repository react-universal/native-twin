import { initialize, stringify } from '@universal-labs/twind-adapter';
import util from 'util';
import { describe, expect, it } from 'vitest';
import { cssParser } from '../src/css/css.parser';
import { CssLexer } from '../src/css/tokenizer-generator';

describe('@universal-labs/stylesheets', () => {
  it('CSS to AST', () => {
    const { tw, tx } = initialize();
    tx('text-2xl translate-x-2 hover:text-red-500 first:bg-gray-100 flex-1');
    CssLexer.injectCss(stringify(tw.target));
    const ast = [...CssLexer.parse()];

    console.log('AST: ', util.inspect(ast, false, null, true /* enable colors */));

    expect(ast).toStrictEqual([
      {
        selector: '.translate-x-2',
        declarations: 'transform:translate(2rem)',
      },
      { selector: '.flex-1', declarations: 'flex:1 1 0%' },
      {
        selector: '.text-2xl',
        declarations: 'font-size:1.5rem;line-height:2rem',
      },
      {
        selector: '.first\\:bg-gray-100:first-child',
        declarations: 'background-color:rgba(243,244,246,1)',
      },
      {
        selector: '.hover\\:text-red-500:hover',
        declarations: 'color:rgba(239,68,68,1)',
      },
    ]);
  });
  it('CSS to Component Styles', () => {
    const addClassNames = cssParser();
    const result = addClassNames(
      'text-2xl translate-x-2 hover:text-red-500 first:bg-gray-100 flex-1',
    );

    expect(result).toStrictEqual({
      evaluated: {
        base: {
          fontSize: 24,
          lineHeight: 32,
          transform: [{ translateX: 32 }, { translateY: 0 }],
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: '0%',
        },
        even: {},
        first: { backgroundColor: 'rgba(243,244,246,1)' },
        group: {},
        last: {},
        odd: {},
        pointer: { color: 'rgba(239,68,68,1)' },
      },
      isGroupParent: false,
    });
  });
});
