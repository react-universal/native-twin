/* eslint-disable no-console */
import { initialize, stringify } from '@universal-labs/twind-adapter';
import util from 'util';
import { describe, expect, it } from 'vitest';
import { CssTokenizer } from '../src/runtime/parser/CssParser';

const { tx, tw } = initialize();

describe('@universal-labs/stylesheets', () => {
  it('Parse CSS Rule', () => {
    tx('text-xl leading-6 text-gray-800 group-hover:text-white');
    const css = stringify(tw.target);
    const tokenizer = new CssTokenizer(css);
    tokenizer.interpreter();

    console.log('AST: ', util.inspect(tokenizer.ast, false, null, true /* enable colors */));

    console.log(
      'EVALUATED: ',
      util.inspect(
        tokenizer.evaluate(tokenizer.ast.result),
        false,
        null,
        true /* enable colors */,
      ),
    );

    expect(tokenizer.ast).toMatchObject({
      targetString: css,
      index: 368,
      result: {
        value: {
          type: 'rules',
          value: [
            {
              type: 'rule',
              value: {
                comment: { type: 'comment', value: '!dbgidc,t,text-gray-800' },
                selector: { type: 'selector', value: '.text-gray-800' },
                declarations: {
                  type: 'declarations',
                  value: '--tw-text-opacity:1;color:rgba(31,41,55,var(--tw-text-opacity))',
                },
              },
            },
            {
              type: 'rule',
              value: {
                comment: { type: 'comment', value: '!dbgidc,w,text-xl' },
                selector: { type: 'selector', value: '.text-xl' },
                declarations: {
                  type: 'declarations',
                  value: 'font-size:1.25rem;line-height:1.75rem',
                },
              },
            },
            {
              type: 'rule',
              value: {
                comment: { type: 'comment', value: '!dbgidc,y,leading-6' },
                selector: { type: 'selector', value: '.leading-6' },
                declarations: { type: 'declarations', value: 'line-height:1.5rem' },
              },
            },
            {
              type: 'rule',
              value: {
                comment: {
                  type: 'comment',
                  value: '!dbjbi8,t,group-hover:text-white',
                },
                selector: {
                  type: 'selector',
                  value: '.group:hover .group-hover\\:text-white',
                },
                declarations: {
                  type: 'declarations',
                  value: '--tw-text-opacity:1;color:rgba(255,255,255,var(--tw-text-opacity))',
                },
              },
            },
          ],
        },
        type: 'stylesheet',
      },
      error: null,
      isError: false,
    });
  });

  it('Parse CSS Nested Rule', () => {
    /*
      TOKENS:
      ATRULE -> initialize rule with @ symbol
      (not|only) -> not or only keyword (optional)
      (print|screen|speech|all) -> media type (optional)
      (and|or) -> media query combinator (optional)
      (mediaFeature) -> media query expression (optional)
    */
    tx('ios:(bg-black text-white) hover:(bg-pink-600) flex-1');
    const css = stringify(tw.target);
    const tokenizer = new CssTokenizer(css);
    tokenizer.interpreter();

    // console.log(
    //   'EVALUATED: ',
    //   util.inspect(
    //     tokenizer.evaluate(tokenizer.ast.result),
    //     false,
    //     null,
    //     true /* enable colors */,
    //   ),
    // );

    expect(tokenizer.ast).toMatchObject({
      targetString: css,
      index: 767,
      result: {
        value: {
          type: 'rules',
          value: [
            {
              type: 'rule',
              value: {
                comment: { type: 'comment', value: '!dbgidc,t,text-gray-800' },
                selector: { type: 'selector', value: '.text-gray-800' },
                declarations: {
                  type: 'declarations',
                  value: '--tw-text-opacity:1;color:rgba(31,41,55,var(--tw-text-opacity))',
                },
              },
            },
            {
              type: 'rule',
              value: {
                comment: { type: 'comment', value: '!dbgidc,v,flex-1' },
                selector: { type: 'selector', value: '.flex-1' },
                declarations: { type: 'declarations', value: 'flex:1 1 0%' },
              },
            },
            {
              type: 'rule',
              value: {
                comment: { type: 'comment', value: '!dbgidc,w,text-xl' },
                selector: { type: 'selector', value: '.text-xl' },
                declarations: {
                  type: 'declarations',
                  value: 'font-size:1.25rem;line-height:1.75rem',
                },
              },
            },
            {
              type: 'rule',
              value: {
                comment: { type: 'comment', value: '!dbgidc,y,leading-6' },
                selector: { type: 'selector', value: '.leading-6' },
                declarations: { type: 'declarations', value: 'line-height:1.5rem' },
              },
            },
            {
              type: 'rule',
              value: {
                comment: { type: 'comment', value: '!dbgj5s,w,hover:bg-pink-600' },
                selector: { type: 'selector', value: '.hover\\:bg-pink-600:hover' },
                declarations: {
                  type: 'declarations',
                  value:
                    '--tw-bg-opacity:1;background-color:rgba(219,39,119,var(--tw-bg-opacity))',
                },
              },
            },
            {
              type: 'rule',
              value: {
                comment: {
                  type: 'comment',
                  value: '!dbjbi8,t,group-hover:text-white',
                },
                selector: {
                  type: 'selector',
                  value: '.group:hover .group-hover\\:text-white',
                },
                declarations: {
                  type: 'declarations',
                  value: '--tw-text-opacity:1;color:rgba(255,255,255,var(--tw-text-opacity))',
                },
              },
            },
            {
              type: 'rule',
              value: {
                comment: { type: 'comment', value: '!dbjbi8,t,ios:text-white' },
                selector: { type: 'selector', value: '.ios\\:text-white:ios' },
                declarations: {
                  type: 'declarations',
                  value: '--tw-text-opacity:1;color:rgba(255,255,255,var(--tw-text-opacity))',
                },
              },
            },
            {
              type: 'rule',
              value: {
                comment: { type: 'comment', value: '!dbjbi8,w,ios:bg-black' },
                selector: { type: 'selector', value: '.ios\\:bg-black:ios' },
                declarations: {
                  type: 'declarations',
                  value: '--tw-bg-opacity:1;background-color:rgba(0,0,0,var(--tw-bg-opacity))',
                },
              },
            },
          ],
        },
        type: 'stylesheet',
      },
      error: null,
      isError: false,
    });
  });
});
