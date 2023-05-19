/* eslint-disable no-console */
import { initialize, stringify } from '@universal-labs/twind-adapter';
import util from 'util';
import { describe, expect, it } from 'vitest';
import { CssLexer } from '../src/runtime/astish';

const { tx, tw } = initialize();

describe('@universal-labs/stylesheets', () => {
  it('Parse CSS Rule', () => {
    tx('text-xl leading-6 text-gray-800 group-hover:text-white');
    const css = stringify(tw.target);
    const tokenizer = CssLexer(css);

    console.log('EVALUATED: ', util.inspect(tokenizer, false, null, true /* enable colors */));

    expect(tokenizer).toMatchObject({});
  });
});
