/* eslint-disable no-console */
import { initialize } from '@universal-labs/twind-adapter';
import util from 'util';
import { describe, expect, it } from 'vitest';
import { parseCss } from '../src/interpreter/sheet.tokenizer';

const { tx, tw } = initialize();
tx('text-2xl leading-6');
const css = tw.target.join('');
describe('@universal-labs/stylesheets', () => {
  it('CSS Lexer', () => {
    const result = parseCss(css);
    console.log('RESULT_PARSE_SHEET: ', util.inspect(result, false, null, true));
    expect(result).toStrictEqual({
      type: 'sheet',
      value: [
        {
          selector: { type: 'selector', value: '.text-2xl' },
          rule: { type: 'rule', value: 'font-size:1.5rem;line-height:2rem' },
        },
        {
          selector: { type: 'selector', value: '.leading-6' },
          rule: { type: 'rule', value: 'line-height:1.5rem' },
        },
      ],
    });
  });
});
