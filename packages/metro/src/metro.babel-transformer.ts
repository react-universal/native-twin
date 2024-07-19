import upstreamTransformer from '@expo/metro-config/babel-transformer';
import micromatch from 'micromatch';
import fs from 'node:fs';
import path from 'node:path';
import { parseDocument } from './babel-parser/twin.parser';
import { sendUpdate } from './decorators/server-middlewares/poll-updates-server';
import { getOrCreateTwinFileHandler } from './services/files/file.manager';
import {
  createStyleSheetManager,
  twinModuleExportString,
} from './twin/Stylesheet.manager';
import { TWIN_CACHE_DIR, TWIN_STYLES_FILE } from './utils/constants';
import { getUserNativeWindConfig, setupNativeTwin } from './utils/load-config';

interface TransformerOpt {
  src: string;
  filename: string;
  options: {
    projectRoot: string;
    platform: string;
    dev: boolean;
    hot: boolean;
    type: string;
    cache: number;
  };
}

export const transform = async ({ filename, options, src }: TransformerOpt) => {
  // console.log('CONFIG: ', config);
  // console.log('REST: ', { projectRoot, filename, data, options });
  const sheet = createStyleSheetManager(options.projectRoot);
  const handler = getOrCreateTwinFileHandler({
    data: src,
    filename,
    projectRoot: options.projectRoot,
  });
  const twConfig = getUserNativeWindConfig(
    path.resolve(options.projectRoot, 'tailwind.config.ts'),
    path.join(options.projectRoot, '.twin-cache'),
  );
  const allowedPaths = twConfig.content.map((x) =>
    path.resolve(options.projectRoot, path.join(x)),
  );

  const isCss = options.type !== 'asset' && matchCss(filename);

  if (isCss) {
    const cssOutput = path.join(options.projectRoot, TWIN_CACHE_DIR, TWIN_STYLES_FILE);
    if (!fs.existsSync(cssOutput)) {
      fs.writeFileSync(cssOutput, '');
    }
    sheet.setRuntimeSheet();
    src = fs.readFileSync(cssOutput, 'utf8');
    src = `${src}\nrequire("@native-twin/metro/build/decorators/server-middlewares/poll-update-client")`;
    // @ts-expect-error
    return upstreamTransformer.transform({ src, filename, options });
  }

  if (!micromatch.isMatch(path.resolve(options.projectRoot, filename), allowedPaths)) {
    // @ts-expect-error
    return upstreamTransformer.transform({ src, filename, options });
  }

  // console.log('ALLOWED: ', { filename, options });

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

      // src = `${sheet.getRuntimeCode(filename)}\n${src}`;
      src = `${src}\nvar __twinComponentStyles = ${JSON.stringify(Object.fromEntries(runtimeStyles))}`;

      const compiled = runtimeStyles.map((x) => {
        const styles = ``;
        return [x[0], styles] as const;
      });

      // let code = '';
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
      // console.log('SRC: ', src);

      // src = `${src}\n\nvar compiled____styles___ = ${JSON.stringify(Object.fromEntries(compiled))}`;
      // console.log('SRC: ', src);
    }
  }

  // @ts-expect-error
  return upstreamTransformer.transform({ src, filename, options });
};

function matchCss(filePath: string): boolean {
  return /\.css$/.test(filePath);
}

// function matchCssModule(filePath: string): boolean {
//   return /\.module(\.(native|ios|android|web))?\.css$/.test(filePath);
// }

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
