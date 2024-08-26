import * as Effect from 'effect/Effect';
import fs from 'node:fs';
import path from 'path';
import { MetroCompilerContext } from '@native-twin/babel/jsx-babel/services';
import { babelRunnable } from '../../metro/src/transformer/babel.transformer';
import { TWIN_CACHE_DIR, TWIN_STYLES_FILE } from '../../metro/src/utils/constants';

export const createBabelTestCompilerProgram = (filePath: string) => {
  const params = {
    filename: filePath,
    src: fs.readFileSync(filePath).toString('utf-8'),
    options: {
      dev: true,
      hot: true,
      platform: 'ios',
      projectRoot: __dirname,
      type: 'source',
    },
  };
  return babelRunnable.pipe(
    Effect.provide(
      MetroCompilerContext.make(params, {
        componentID: true,
        order: true,
        styledProps: true,
        templateStyles: false,
        tree: false,
      }),
    ),
    Effect.runPromise,
  );
};

export const twinFilePath = path.join(__dirname, TWIN_CACHE_DIR, TWIN_STYLES_FILE);
