import type { JsOutput } from 'metro-transform-worker';
import fs from 'node:fs';
import path from 'node:path';
import { createTailwind } from '@native-twin/core';
import { createVirtualSheet } from '@native-twin/css';
import { twinShift } from '../src/babel/twin.shift';
import { transform } from '../src/transformer/metro.transformer';
import { createCacheDir } from '../src/utils/file.utils';
import twConfig from './tailwind.config';
import {
  jsxCodeOutputPath,
  metroCodeOutputPath,
  metroTestBaseConfig,
  testBaseTransformOptions,
  twinFilePath,
} from './test.utils';

beforeAll(() => {
  console.log('ROOT: ', path.join(__dirname));
  createCacheDir(__dirname);
  fs.writeFileSync(twinFilePath, '');
});

describe('Metro transformer', () => {
  it('typescript parser', async () => {
    const twin = createTailwind(twConfig, createVirtualSheet());
    const result = await twinShift(
      'fixtures/code.tsx',
      fs.readFileSync(path.join(__dirname, 'fixtures/jsx', 'code.tsx'), 'utf-8'),
      twin,
    );
    fs.writeFileSync(jsxCodeOutputPath, result.full ?? 'ERROR');
    expect(result.code).toBeDefined();
  });

  it('metro transformer', async () => {
    const result = await transform(
      { ...metroTestBaseConfig, projectRoot: path.join(__dirname) } as any,
      path.join(__dirname),
      'fixtures/out.tsx',
      fs.readFileSync(path.join(__dirname, 'fixtures/jsx', 'code.tsx')),
      { ...testBaseTransformOptions, type: 'script' },
    );

    const code =
      (result.output as JsOutput[])
        .map((x: JsOutput): string => x.data.code)
        .join('\n') ?? 'ERROR';

    fs.writeFileSync(metroCodeOutputPath, code);
    expect(code).toBeDefined();
  });
});
