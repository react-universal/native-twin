import { ExpoJsOutput } from '@expo/metro-config/build/serializer/jsOutput';
import { wrapDevelopmentCSS } from '@expo/metro-config/build/transform-worker/css';
import { transformPostCssModule } from '@expo/metro-config/build/transform-worker/postcss';
import worker from 'metro-transform-worker';
// @ts-expect-error
import countLines from 'metro/src/lib/countLines';
import { NativeTwinTransformerOpts } from '@native-twin/babel/jsx-babel/models';

export const transformCSSExpo = async (
  config: NativeTwinTransformerOpts,
  projectRoot: string,
  filename: string,
  data: Buffer | string,
  options: worker.JsTransformOptions,
) => {
  const reactServer = options.customTransformOptions?.environment === 'react-server';

  // const environment = options.customTransformOptions?.environment;
  // const isServer = environment === 'node' || environment === 'react-server';

  // eslint-disable-next-line prefer-const
  let code = data.toString('utf8');

  // Apply postcss transforms
  const postcssResults = await transformPostCssModule(projectRoot, {
    src: code,
    filename,
  });

  const { transform } = require('lightningcss') as typeof import('lightningcss');

  // TODO: Add bundling to resolve imports
  // https://lightningcss.dev/bundling.html#bundling-order

  const cssResults = transform({
    filename,
    code: Buffer.from(code),
    sourceMap: false,
    cssModules: false,
    projectRoot,
    minify: options.minify,
  });

  // TODO: Warnings:
  // cssResults.warnings.forEach((warning) => {
  // });

  // Create a mock JS module that exports an empty object,
  // this ensures Metro dependency graph is correct.
  const jsModuleResults = await worker.transform(
    config,
    projectRoot,
    filename,
    options.dev
      ? Buffer.from(
          // @ts-expect-error
          wrapDevelopmentCSS({ src: code, filename, reactServer }),
        )
      : Buffer.from(''),
    options,
  );

  const cssCode = cssResults.code.toString();

  // In production, we export the CSS as a string and use a special type to prevent
  // it from being included in the JS bundle. We'll extract the CSS like an asset later
  // and append it to the HTML bundle.
  const output: ExpoJsOutput[] = [
    {
      type: 'js/module',
      data: {
        ...(jsModuleResults.output[0] as ExpoJsOutput).data,

        // Append additional css metadata for static extraction.
        css: {
          code: cssCode,
          lineCount: countLines(cssCode),
          map: [],
          functionMap: null,
          // Disable caching for CSS files when postcss is enabled and has been run on the file.
          // This ensures that things like tailwind can update on every change.
          skipCache: postcssResults.hasPostcss,
        },
      },
    },
  ];

  return {
    dependencies: jsModuleResults.dependencies,
    output,
  };
};
