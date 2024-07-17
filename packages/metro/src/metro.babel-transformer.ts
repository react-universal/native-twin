import upstreamTransformer from '@expo/metro-config/babel-transformer';
import micromatch from 'micromatch';
// import fs from 'node:fs';
import path from 'node:path';
import { parseDocument } from './babel-parser/twin.parser';
import { getUserNativeWindConfig, setupNativeTwin } from './utils/load-config';

interface TransformerOpt {
  src: string;
  filename: string;
  options: {
    projectRoot: string;
    platform: string;
    dev: boolean;
    hot: boolean;
    cache: number;
  };
}

const createCache = () => {
  let cache = 0;
  return {
    get: () => cache,
    increment: () => {
      cache += cache + 1;
    },
  };
};
const cacheH = createCache();
export const transform = async ({ filename, options, src }: TransformerOpt) => {
  // console.log('CONFIG: ', config);
  // console.log('REST: ', { projectRoot, filename, data, options });
  const twConfig = getUserNativeWindConfig(
    path.resolve(options.projectRoot, 'tailwind.config.ts'),
    path.join(options.projectRoot, '.twin-cache'),
  );
  const allowedPaths = twConfig.content.map((x) =>
    path.resolve(options.projectRoot, path.join(x)),
  );
  if (!micromatch.isMatch(path.resolve(options.projectRoot, filename), allowedPaths)) {
    // @ts-expect-error
    return upstreamTransformer.transform({ src, filename, options });
  }
  console.log('BABEL: START_TRANSFORM: ', cacheH.get());
  console.log('TRANSFORM_BABEL_OPTIONS: ', options);
  cacheH.increment();
  // console.log('ALLOWED: ', { filename, options });

  if (options.platform) {
    const twin = setupNativeTwin(twConfig, {
      dev: options.dev,
      hot: options.hot,
      platform: options.platform,
    });
    const transformed = parseDocument(src, twin.tw);
    if (transformed) {
      const code = transformed.generatedCode.code;
      // if (options.platform !== 'web' && options.dev && options.hot) {
      //   code = `${code}\nrequire("@native-twin/metro/build/poll-update-client")`;
      // }
      // const outFilePath = path.join(options.projectRoot, '.twin-cache', filename);
      // const outFileDir = path.dirname(outFilePath);
      // if (!fs.existsSync(outFileDir)) {
      //   fs.mkdirSync(outFileDir, { recursive: true });
      // }
      // fs.writeFileSync(outFilePath, code);
      // @ts-expect-error
      return upstreamTransformer.transform({
        src: code,
        filename,
        options: { ...options, cache: options.cache ? options.cache++ : cacheH.get() },
      });
    }
  }

  // @ts-expect-error
  return upstreamTransformer.transform({ src, filename, options });
};
