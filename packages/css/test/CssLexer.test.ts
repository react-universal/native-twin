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
    tx('flex-1 leading-6 text-2xl -mt-[10vw] translate-y-2 hover:text-lg');
    const result = tw.target.map((x) =>
      parseCssString(x, {
        deviceHeight: 1280,
        deviceWidth: 720,
        rem: 16,
      }),
    );

    console.log('RESULT_PARSE_SHEET: ', util.inspect(result, false, null, true));

    expect(result.length).toBe(6);
  });

  // it('CSS Lexer', () => {
  //   tx('translate-y-2');
  //   const css = tw.target.join('');
  //   const result = parseCssString(css);
  //   console.log('RESULT_PARSE_SHEET: ', util.inspect(result, false, null, true));
  //   expect(result.evaluate().length).toBe(1);
  // });
});
