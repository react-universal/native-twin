import upstreamTransformer from '@expo/metro-config/babel-transformer';
import worker from 'metro-transform-worker';
import micromatch from 'micromatch';
import path from 'node:path';
import { sendUpdate } from '../server/poll-updates-server';
import { createStyleSheetManager } from '../sheet/Stylesheet.manager';
import { twinModuleExportString } from '../sheet/Stylesheet.manager';
import { TwinTransformerOptions, TwinTransformFn } from '../types/transformer.types';
import { getUserNativeWindConfig, setupNativeTwin } from '../utils/load-config';
import { parseDocument } from './babel-parser/twin.parser';
import { cssTransformer } from './css.transformer';

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
  // @ts-expect-error
  const handler = getOrCreateTwinFileHandler({ data, filename, projectRoot });

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

export const transformOld = async ({
  filename,
  options,
  src,
}: TwinTransformerOptions) => {
  const sheet = createStyleSheetManager(options.projectRoot);
  // @ts-expect-error
  const handler = getOrCreateTwinFileHandler({
    data: src,
    filename,
    projectRoot: options.projectRoot,
    type: options.type,
  });
  const twConfig = getUserNativeWindConfig(
    path.resolve(options.projectRoot, 'tailwind.config.ts'),
    path.join(options.projectRoot, '.twin-cache'),
  );
  const allowedPaths = twConfig.content.map((x) =>
    path.resolve(options.projectRoot, path.join(x)),
  );

  const isCss = options.type !== 'asset' && matchCss(filename);

  if (isCss) return cssTransformer({ filename, options, src }, sheet);

  if (!micromatch.isMatch(path.resolve(options.projectRoot, filename), allowedPaths)) {
    // @ts-expect-error
    return upstreamTransformer.transform({ src, filename, options });
  }
  

  if (options.platform) {
    const twin = setupNativeTwin(twConfig, {
      dev: options.dev,
      hot: options.hot,
      platform: options.platform,
    });
    const transformed = parseDocument(filename, handler.version, src, twin.tw);
    if (transformed) {
      src = transformed.code;
      handler.compile = false;
      sheet.registerEntries(transformed.compiledClasses);
      const runtimeStyles = Array.from(transformed.twinComponentStyles.entries());

      src = `${src}\nvar __twinComponentStyles = ${JSON.stringify(Object.fromEntries(runtimeStyles))}`;

      const compiled = runtimeStyles.map((x) => {
        const styles = ``;
        return [x[0], styles] as const;
      });

      if (compiled.length > 0) {
        const componentsContent = Array.from(runtimeStyles).map(
          ([key, value]): [string, any] => {
            const objValue = `require("@native-twin/jsx").StyleSheet.registerComponent("${key}", ${JSON.stringify(value)})`;

            return [key, objValue];
          },
        );

        const fn = createRuntimeFunction(
          'get_compiled____styles___',
          createObjectExpression(componentsContent),
        );
        src = `${src}\n${fn}`;
        const registered = sheet.registerEntries(transformed.compiledClasses);
        if (registered) {
          sendUpdate(
            Buffer.from(registered).toString('utf8').replace(twinModuleExportString, ''),
            handler.version,
          );
        }
      }
    }
  }

  // @ts-expect-error
  return upstreamTransformer.transform({ src, filename, options });
};

function matchCss(filePath: string): boolean {
  return /\.css$/.test(filePath);
}

const createRuntimeFunction = (functionName: string, contents: string) => {
  return `function ${functionName}() ${createBlockContent(contents)}`;
};
const createBlockContent = (contents: string) => {
  return `{\n return ${contents} \n};\n`;
};
const createObjectExpression = (values: [string, any][]) => {
  return `{\n ${values.map((x) => createKeyValuePair(x)).join(',')} \n}`;
};
const createKeyValuePair = (value: [string, any]) => {
  return `["${value[0]}"]: ${value[1]}`;
};
