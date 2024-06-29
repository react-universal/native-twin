import * as babel from '@babel/core';
import * as t from '@babel/types';
import { readFileSync } from 'fs';
import path from 'path';

describe('Babel exec test', () => {
  it('Test exec code', () => {
    const code = readFileSync(
      path.join(__dirname, './fixtures/compiled/code.js'),
    ).toString('utf-8');
    console.log('CODE: ', code);

    const output = babel.transform(code, {
      presets: [require('../babel')],
      filename: '/someFile.js',
      minified: false,
      generatorOpts: {
        minified: false,
      },
      compact: false,
    });
    if (output) {
      console.log('CODE: ', output.code);
    }

    expect(true).toBeTruthy();
  });
});
