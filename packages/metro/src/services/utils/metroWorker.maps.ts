import { toBufferThenString } from '@native-twin/helpers/server';
import { MetroWorkerInput } from '../models/metro.models';

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
      src: toBufferThenString(data),
      options: {
        customTransformOptions: {
          ...options.customTransformOptions,
          baseUrl,
          environment,
          inputCSS: config.inputCSS,
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
