import * as babel from '@babel/core';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

export const runPluginForFixture = (inputFile: string, outputFile: string) => {
  const code = readFileSync(inputFile, 'utf-8');

  const output = babel.transform(code, {
    parserOpts: {
      plugins: ['jsx', 'typescript'],
    },
    presets: [
      [
        require('../babel'),
        {
          twinConfigPath: path.join(__dirname, './tailwind.config.ts'),
        },
      ],
      // [
      //   'babel-preset-expo',
      //   {
      //     jsxImportSource: '@native-twin/jsx',
      //   },
      // ],
    ],
    filename: inputFile,
    ast: true,
    cwd: path.join(__dirname),
    envName: 'development',
    minified: false,
    generatorOpts: {
      minified: false,
    },
    compact: false,
  });

  writeFileSync(outputFile, output?.code ?? 'ERROR!');
  return readFileSync(outputFile, 'utf-8');
};
