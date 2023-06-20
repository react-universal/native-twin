/* eslint-disable no-console */
import { initialize } from '@universal-labs/twind-adapter';
import util from 'util';
import { beforeEach, describe, expect, it } from 'vitest';
import { parseCssString } from '../src';

const { tx, tw } = initialize();

describe('@universal-labs/stylesheets', () => {
  beforeEach(() => {
    tw.clear();
  });
  it('CSS Lexer', () => {
    tx('leading-6 text-2xl');
    const css = tw.target.join('');
    const result = parseCssString(css);

    console.log('RESULT_PARSE_SHEET: ', util.inspect(result(), false, null, true));

    expect(result().length).toBe(3);
  });

  it('CSS Lexer', () => {
    tx('translate-y-2');
    const css = tw.target.join('');
    const result = parseCssString(css);
    console.log('RESULT_PARSE_SHEET: ', util.inspect(result(), false, null, true));
    expect(result().length).toBe(1);
  });
});
