import * as Effect from 'effect/Effect';
import fs from 'node:fs';
import path from 'path';
import { MetroCompilerContext } from '@native-twin/babel/jsx-babel/services';
import { TWIN_CACHE_DIR, TWIN_STYLES_FILE } from '../src/constants';
import { transformJSXFile } from '../src/jsx/ast/jsx.visitors';
import { BabelTransformerFn } from '../src/jsx/models';
import { BabelTransformerServiceLive, NativeTwinService } from '../src/jsx/services';

export const runFixture = async (fixturePath: string, platform: string) => {
  const codePath = path.join(__dirname, 'fixtures', fixturePath, 'code.tsx');
  const outputPath = path.join(__dirname, 'fixtures', fixturePath, `out.${platform}.tsx`);
  fs.writeFileSync(outputPath, '');
  const result = await createBabelTestCompilerProgram(codePath, platform);
  fs.writeFileSync(outputPath, result.generated ?? 'ERROR');
  return { result, file: fs.readFileSync(outputPath) };
};

export const createBabelTestCompilerProgram = (filePath: string, platform: string) => {
  const params: Parameters<BabelTransformerFn>[0] = {
    filename: filePath,
    src: fs.readFileSync(filePath).toString('utf-8'),
    options: {
      customTransformOptions: {
        baseUrl: '',
        environment: '',
        inputCss: '',
        routerRoot: '',
      },
      dev: true,
      hot: true,
      platform,
      projectRoot: __dirname,
      type: 'source',
    },
  };
  return transformJSXFile(params.src).pipe(
    Effect.provide(BabelTransformerServiceLive),
    Effect.provide(
      MetroCompilerContext.make(params, {
        componentID: true,
        order: true,
        styledProps: true,
        templateStyles: true,
        tree: true,
      }),
    ),
    Effect.provide(NativeTwinService.make(params.options)),
    Effect.runPromise,
  );
};

export const twinFilePath = path.join(__dirname, TWIN_CACHE_DIR, TWIN_STYLES_FILE);
