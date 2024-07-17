import worker from 'metro-transform-worker';
import micromatch from 'micromatch';
import path from 'node:path';
import { SheetEntry } from '@native-twin/css';
import { parseDocument } from './babel-parser/twin.parser';
import { sendUpdate } from './decorators/server-middlewares/poll-updates-server';
import { TwinTransformFn } from './types/transformer.types';
import { getUserNativeWindConfig, setupNativeTwin } from './utils/load-config';

const createCache = () => {
  let cache = 0;
  let prevCache = 0;
  let buffer = '[]';
  return {
    get: () => cache,
    isNew: () => cache > 0 && prevCache !== cache,
    increment: () => {
      prevCache = cache;
      cache += 1;
    },
    currentBuffer: () => buffer,
    getBuffer: (): SheetEntry[] => JSON.parse(buffer),
    concatBuffer: (entries: SheetEntry[]) => {
      const result: SheetEntry[] = JSON.parse(buffer);
      buffer = JSON.stringify([...result, ...entries]);
    },
  };
};
const cacheH = createCache();
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

  console.log('METRO: TRANSFORM_START: ', cacheH.get());

  if (options.platform) {
    const twConfig = getUserNativeWindConfig(config.tailwindConfigPath, config.outputDir);

    data = Buffer.from(data).toString('utf8');

    const twin = setupNativeTwin(twConfig, {
      dev: options.dev,
      hot: options.hot,
      platform: options.platform,
    });
    const transformed = parseDocument(filename, cacheH.get(), data, twin.tw);
    if (transformed) {
      data = transformed.generatedCode.code;
      const runtimeStyles = Object.fromEntries(transformed.twinComponentStyles.entries());
      const runtimeCode = `\nvar __twinComponentStyles = {...${JSON.stringify(runtimeStyles)}}`;

      if (options.platform !== 'web' && options.dev && options.hot) {
        data = `${data}\n${runtimeCode}\nrequire("@native-twin/metro/build/poll-update-client")`;
      }

      if (cacheH.isNew()) {
        cacheH.increment();
        cacheH.concatBuffer(transformed.compiledClasses);
        sendUpdate(cacheH.currentBuffer(), cacheH.get());
      } else {
        cacheH.increment();
      }
    }
  }

  data = Buffer.from(data);

  return worker.transform(config, projectRoot, filename, data, options);
};
