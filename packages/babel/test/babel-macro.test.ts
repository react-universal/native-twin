import * as babel from '@babel/core';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

describe('Babel Macro test', () => {
  it('Basic macro', () => {
    const code = readFileSync(path.join(__dirname, './fixtures/jsx-macro/code.tsx')).toString(
      'utf-8',
    );
    // console.log('CODE: ', code);

    const output = babel.transform(code, {
      plugins: ['@babel/plugin-syntax-jsx', 'macros'],
      filename: path.join(__dirname, 'fixtures', 'jsx-macro', 'code.tsx'),
      cwd: path.join(__dirname),
      envName: 'development',
      minified: false,
      generatorOpts: {
        minified: false,
      },
      compact: false,
    });

    console.log(output?.code);
    if (output?.code) {
      writeFileSync(path.join(__dirname, 'fixtures', 'jsx-macro', 'out.jsx'), output.code);
    }

    expect(output?.code).toBeDefined();
  });
});
