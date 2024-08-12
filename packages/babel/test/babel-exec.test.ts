import * as babel from '@babel/core';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

describe('Babel exec test', () => {
  it('Test exec code', () => {
    const code = readFileSync(path.join(__dirname, './fixtures/jsx/code.tsx')).toString(
      'utf-8',
    );
    // console.log('CODE: ', code);

    const output = babel.transform(code, {
      presets: [
        [
          require('../babel'),
          {
            twinConfigPath: './tailwind.config.ts',
          },
        ],
      ],
      // plugins: ['@babel/plugin-syntax-jsx', require('../plugin')],
      filename: path.join(__dirname, 'fixtures', 'jsx', 'code.tsx'),
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
      writeFileSync(path.join(__dirname, 'fixtures', 'jsx', 'out.jsx'), output.code);
    }

    expect(output?.code).toBeDefined();
  });
});
