import * as babel from '@babel/core';
import generate from '@babel/generator';
import { parse } from '@babel/parser';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

describe('Babel exec test', () => {
  it('Test exec code', () => {
    const code = readFileSync(path.join(__dirname, './fixtures/jsx/code.tsx')).toString(
      'utf-8',
    );

    const output = babel.transform(code, {
      parserOpts: {
        plugins: ['jsx', 'typescript'],
      },
      plugins: [
        [
          require('../plugin'),
          {
            twinConfigPath: './tailwind.config.ts',
          },
        ],
      ],
      filename: path.join(__dirname, 'fixtures', 'jsx', 'code.tsx'),
      ast: true,
      cwd: path.join(__dirname),
      envName: 'development',
      minified: false,
      generatorOpts: {
        minified: false,
      },
      compact: false,
    });

    writeFileSync(
      path.join(__dirname, 'fixtures', 'jsx', 'out.jsx'),
      output?.code ?? 'ERROR!',
    );

    expect(
      readFileSync(path.join(__dirname, './fixtures/jsx/code.tsx')).toString('utf-8'),
    ).not.toBe('ERROR!');
  });

  it('text both sources', () => {
    const code = readFileSync(path.join(__dirname, './fixtures/jsx/code.tsx')).toString(
      'utf-8',
    );
    const code2 = readFileSync(
      path.join(__dirname, './fixtures/jsx/code-i.tsx'),
    ).toString('utf-8');
    const codeA = parse(code, {
      sourceFilename: 'code.tsx',
      plugins: ['typescript', 'jsx'],
      sourceType: 'module',
    });
    const codeB = parse(code2, {
      sourceFilename: 'code-i.tsx',
      plugins: ['typescript', 'jsx'],
      sourceType: 'module',
    });

    const ast: any = {
      type: 'Program',
      body: [...codeA.program.body].concat(codeB.program.body),
    };
    const generated = generate(
      ast,
      { sourceMaps: true },
      {
        'code.tsx': code,
        'code-i.tsx': code2,
      },
    );
    expect(generated.code).toBeDefined();
  });
});
