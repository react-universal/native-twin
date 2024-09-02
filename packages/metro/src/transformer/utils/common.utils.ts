import fs from 'fs';
import path from 'path';
import { TWIN_CACHE_DIR } from '@native-twin/babel/jsx-babel';
import { ensureBuffer } from '@native-twin/helpers/server';
import { MetroWorkerInput } from '../models/metro.models';

export const setupCssOutput = (filename: string) => {
  if (!fs.existsSync(filename)) {
    fs.mkdirSync(path.resolve(TWIN_CACHE_DIR), { recursive: true });
    fs.writeFileSync(filename, '');
  }
};

export const metroWorkerInputToCompilerCtx = ({
  config,
  data,
  filename,
  options,
  projectRoot,
}: MetroWorkerInput) => {
  const baseUrl: string = (options.customTransformOptions?.['baseUrl'] as string) ?? '';
  const environment: string =
    (options.customTransformOptions?.['environment'] as string) ?? 'client';
  const routerRoot: string =
    (options.customTransformOptions?.['routerRoot'] as string) ?? '.';
  return {
    options: {
      filename,
      src: ensureBuffer(data).toString('utf-8'),
      options: {
        customTransformOptions: {
          ...options.customTransformOptions,
          baseUrl,
          environment,
          inputCss: config.inputCss,
          routerRoot,
        },
        dev: options.dev,
        hot: options.hot,
        platform: options.platform ?? 'native',
        projectRoot,
        type: options.type,
      },
    },
    generate: {
      componentID: true,
      styledProps: true,
      templateStyles: true,
      tree: true,
      order: true,
    },
  };
};
