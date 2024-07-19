import worker from 'metro-transform-worker';
import micromatch from 'micromatch';
import path from 'node:path';
import { parseDocument } from './babel-parser/twin.parser';
// import { sendUpdate } from './decorators/server-middlewares/poll-updates-server';
import { getOrCreateTwinFileHandler } from './services/files/file.manager';
import { createStyleSheetManager } from './twin/Stylesheet.manager';
import { TwinTransformFn } from './types/transformer.types';
import { getUserNativeWindConfig, setupNativeTwin } from './utils/load-config';

export const transform: TwinTransformFn = async (
  config,
  projectRoot,
  filename,
  data,
  options,
) => {
  const sheet = createStyleSheetManager(projectRoot);
  const allowedPaths = config.allowedFiles.map((x) =>
    path.resolve(projectRoot, path.join(x)),
  );
  const transformer = config.transformerPath
    ? require(config.transformerPath).transform
    : worker.transform;
  if (!micromatch.isMatch(path.resolve(projectRoot, filename), allowedPaths)) {
    return transformer(config, projectRoot, filename, data, options);
  }
  const handler = getOrCreateTwinFileHandler({ config, data, filename, projectRoot });

  if (options.platform && handler.compile) {
    data = Buffer.from(data).toString('utf8');
    handler.compile = false;
    const twConfig = getUserNativeWindConfig(config.tailwindConfigPath, config.outputDir);

    const twin = setupNativeTwin(twConfig, {
      dev: options.dev,
      hot: options.hot,
      platform: options.platform,
    });
    const transformed = parseDocument(filename, handler.version, data, twin.tw);
    if (transformed) {
      data = transformed.code;
      const runtimeStyles = Object.fromEntries(transformed.twinComponentStyles.entries());
      data = `${sheet.getRuntimeCode(filename)}\n${data}`;
      data = `${data}\nvar __twinComponentStyles = ${JSON.stringify(runtimeStyles)}`;
      sheet.registerEntries(transformed.compiledClasses);
    }
  }

  data = Buffer.isBuffer(data) ? data : Buffer.from(data);

  return worker.transform(config, projectRoot, filename, data, options);
};
