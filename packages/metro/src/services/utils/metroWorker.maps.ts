import { ensureBuffer } from '@native-twin/helpers/server';
import { MetroWorkerInput } from '../../transformer/models/metro.models';

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
