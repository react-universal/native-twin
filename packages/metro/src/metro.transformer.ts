import worker from 'metro-transform-worker';
import micromatch from 'micromatch';
import path from 'node:path';
import { getDocumentLanguageLocations } from './babel-parser/twin.parser';
import { TwinTransformFn } from './types/transformer.types';
import { getUserNativeWindConfig, setupNativeTwin } from './utils/load-config';

export const transform: TwinTransformFn = async (
  config,
  projectRoot,
  filename,
  data,
  options,
) => {
  const allowedPaths = config.allowedFiles.map((x) =>
    path.resolve(projectRoot, path.join(x)),
  );

  const transformer = config.transformerPath
    ? require(config.transformerPath).transform
    : worker.transform;
  if (!micromatch.isMatch(path.resolve(projectRoot, filename), allowedPaths)) {
    return transformer(config, projectRoot, filename, data, options);
  }

  if (options.platform) {
    const twConfig = getUserNativeWindConfig(config.tailwindConfigPath, config.outputDir);

    const code = Buffer.from(data).toString('utf8');

    const tw = setupNativeTwin(twConfig, {
      dev: options.dev,
      hot: options.hot,
      platform: options.platform,
    });
    const transformed = getDocumentLanguageLocations(code, tw);
    if (transformed) {
      const code = Buffer.from(transformed.generatedCode.code);
      console.log('BUFFERED: ', transformed.generatedCode);
      return worker.transform(config, projectRoot, filename, code, options);
    }
  }

  return worker.transform(config, projectRoot, filename, data, options);
};
