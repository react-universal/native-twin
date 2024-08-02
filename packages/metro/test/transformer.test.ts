import type { JsOutput } from 'metro-transform-worker';
import fs from 'node:fs';
import path from 'node:path';
import { transform } from '../src/transformer/metro.transformer';
import { createCacheDir } from '../src/utils/file.utils';
import {
  createTestCompilerProgram,
  jsxCodeOutputPath,
  metroCodeOutputPath,
  metroTestBaseConfig,
  testBaseTransformOptions,
  twinFilePath,
} from './test.utils';

describe('Metro transformer', () => {
  beforeAll(() => {
    createCacheDir(__dirname);
    fs.writeFileSync(twinFilePath, '');
  });

  it('typescript parser', async () => {
    const result = await createTestCompilerProgram(
      path.join(__dirname, 'fixtures/jsx', 'code.tsx'),
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
