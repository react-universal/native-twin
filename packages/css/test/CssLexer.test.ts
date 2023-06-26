/* eslint-disable no-console */
import { initialize } from '@universal-labs/twind-adapter';
import util from 'util';
import { beforeEach, describe, expect, it } from 'vitest';
import { CssResolver } from '../src/parser-fn/css.resolver';

const { tx, tw } = initialize();

describe('@universal-labs/stylesheets', () => {
  beforeEach(() => {
    tw.clear();
  });
  it('CSS Lexer', () => {
    tx('flex-1 leading-6');
    const result = tw.target.map(CssResolver);
    console.log('CSS_RAW: ', JSON.stringify(tw.target, null, 2));
    console.log('RESULT_PARSE_SHEET: ', util.inspect(result, false, null, true));

    expect(result).toStrictEqual([
      {
        isError: false,
        result: {
          type: 'RULE',
          value: {
            selector: { type: 'SELECTOR', value: { name: '.flex-1', group: 'base' } },
            declaration: {
              type: 'DECLARATION',
              value: {
                property: { type: 'PROPERTY', value: 'flex' },
                value: {
                  type: 'VALUE',
                  value: [
                    {
                      type: 'DIMENSIONS',
                      value: { value: '1', unit: 'none' },
                    },
                    {
                      type: 'DIMENSIONS',
                      value: { value: '1', unit: 'none' },
                    },
                    {
                      type: 'DIMENSIONS',
                      value: { value: '0', unit: '%' },
                    },
                  ],
                },
              },
            },
          },
        },
        cursor: 20,
      },
      {
        isError: false,
        result: {
          type: 'RULE',
          value: {
            selector: {
              type: 'SELECTOR',
              value: { name: '.leading-6', group: 'base' },
            },
            declaration: {
              type: 'DECLARATION',
              value: {
                property: { type: 'PROPERTY', value: 'line-height' },
                value: {
                  type: 'VALUE',
                  value: [
                    {
                      type: 'DIMENSIONS',
                      value: { value: '1.5', unit: 'rem' },
                    },
                  ],
                },
              },
            },
          },
        },
        cursor: 30,
      },
    ]);
  });

  // it('CSS Lexer', () => {
  //   tx('translate-y-2');
  //   const css = tw.target.join('');
  //   const result = parseCssString(css);
  //   console.log('RESULT_PARSE_SHEET: ', util.inspect(result, false, null, true));
  //   expect(result.evaluate().length).toBe(1);
  // });
});
