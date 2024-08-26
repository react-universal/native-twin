import type { JsOutput } from 'metro-transform-worker';
import fs from 'node:fs';
import path from 'node:path';
import { transform } from '../src/transformer/metro.transformer';
import { TWIN_CACHE_DIR } from '../src/utils';
import { createCacheDir } from '../src/utils/file.utils';
import {
  metroCodeOutputPath,
  metroTestBaseConfig,
  testBaseTransformOptions,
} from './test.utils';

const cssOutput = path.join(__dirname, TWIN_CACHE_DIR);
beforeAll(() => {
  createCacheDir(cssOutput);
});

describe('Metro transformer', () => {
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
