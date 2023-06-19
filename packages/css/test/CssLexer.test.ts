/* eslint-disable no-console */
import { initialize } from '@universal-labs/twind-adapter';
import util from 'util';
import { beforeEach, describe, expect, it } from 'vitest';
import { cssToAst } from '../src/interpreter/sheet.tokenizer';

const { tx, tw } = initialize();

describe('@universal-labs/stylesheets', () => {
  beforeEach(() => {
    tw.clear();
  });
  it('CSS Lexer', () => {
    tx('leading-6 text-2xl');
    const css = tw.target.join('');
    const result = cssToAst(css);
    console.log('RESULT_PARSE_SHEET: ', util.inspect(result, false, null, true));
    expect(result).toStrictEqual({
      type: 'sheet',
      rules: [
        {
          type: 'rule',
          selector: '.text-2xl',
          declarations: [
            {
              type: 'declaration',
              property: 'font-size',
              value: { type: 'dimensions', unit: 'rem', value: 1.5 },
            },
            {
              type: 'declaration',
              property: 'line-height',
              value: { type: 'dimensions', unit: 'rem', value: 2 },
            },
          ],
        },
        {
          type: 'rule',
          selector: '.leading-6',
          declarations: [
            {
              type: 'declaration',
              property: 'line-height',
              value: { type: 'dimensions', unit: 'rem', value: 1.5 },
            },
          ],
        },
      ],
    });
  });

  it('CSS Lexer', () => {
    tx('translate-y-2');
    const css = tw.target.join('');
    const result = cssToAst(css);
    console.log('RESULT_PARSE_SHEET: ', util.inspect(result, false, null, true));
    expect(result).toStrictEqual({
      type: 'sheet',
      rules: [
        {
          type: 'rule',
          selector: '.translate-y-2',
          declarations: [
            {
              type: 'declaration',
              property: 'transform',
              value: {
                type: 'transform',
                dimension: '2d',
                x: { type: 'dimensions', unit: 'none', value: 0 },
                y: { type: 'dimensions', unit: 'rem', value: 2 },
                z: undefined,
              },
            },
          ],
        },
      ],
    });
  });
});
