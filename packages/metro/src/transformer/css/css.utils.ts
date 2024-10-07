import { transformPostCssModule } from '@expo/metro-config/build/transform-worker/postcss';
import CodeBlockWriter from 'code-block-writer';
import { pipe } from 'effect/Function';
import worker from 'metro-transform-worker';
// @ts-expect-error
import countLines from 'metro/src/lib/countLines';
import type { NativeTwinTransformerOpts } from '@native-twin/babel/jsx-babel/models';
import { escapeBackticksAndOctals } from '@native-twin/helpers';
import { pathToHtmlSafeName } from '@native-twin/helpers/server';
import type { ExpoJsOutput } from '@expo/metro-config/build/serializer/jsOutput';

export const transformCSSExpo = async (
  config: NativeTwinTransformerOpts,
  projectRoot: string,
  filename: string,
  data: Buffer | string,
  options: worker.JsTransformOptions,
) => {
  const reactServer = options.customTransformOptions?.environment === 'react-server';

  // eslint-disable-next-line prefer-const
  let code = data.toString('utf8');

  // Apply postcss transforms
  const postcssResults = await transformPostCssModule(projectRoot, {
    src: code,
    filename,
  });

  // @ts-expect-error
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
      ? Buffer.from(wrapDevelopmentCSS({ src: code, filename, reactServer }))
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

export function getHotReplaceTemplate(id: string) {
  // In dev mode, we need to replace the style tag instead of appending it
  // use the path as the expo-css-hmr attribute to find the style tag
  // to replace.
  const attr = JSON.stringify(pathToHtmlSafeName(id));
  const writer = new CodeBlockWriter();
  writer.writeLine(`style.setAttribute('data-expo-css-hmr', ${attr})`);
  writer.writeLine(`style.setAttribute('data-native-twin', "");`);
  writer.writeLine(
    `const previousStyle = document.querySelector('[data-expo-css-hmr=${attr}]');`,
  );

  pipe(writer.newLine().write(`if (previousStyle) `), (w) =>
    w.block(() => {
      w.indent().write(`previousStyle.parentNode.removeChild(previousStyle);`);
    }),
  );

  return writer.toString();
}

export function wrapDevelopmentCSS(props: {
  src: string;
  filename: string;
  reactServer: boolean;
}) {
  const withBackTicksEscaped = escapeBackticksAndOctals(props.src);

  const writer = new CodeBlockWriter();
  writer.writeLine(
    `const head = document.head || document.getElementsByTagName('head')[0];`,
  );
  writer.writeLine(`const style = document.createElement('style');`);
  writer.writeLine(`${getHotReplaceTemplate(props.filename)}`);
  writer.writeLine(`style.setAttribute('data-expo-loader', 'css');`);
  writer.writeLine(`head.appendChild(style);`);
  writer.writeLine(`const css = \`${withBackTicksEscaped}\`;`);

  const injectClientStyle = pipe(
    writer.write(`if (style.styleSheet)`).space(),
    (w) =>
      w.block(() => {
        writer.indent().write(`style.styleSheet.cssText = css;`);
      }),
    (w) => writer.space().write('else').space(),
    (w) =>
      w.block(() => {
        w.write(`style.appendChild(document.createTextNode(css));`);
      }),
    (w) => w.toString(),
  );

  // When bundling React Server Components, add an iife which will broadcast the client JS script to the root client bundle.
  // This will ensure the global CSS is available in the browser in development.
  if (props.reactServer) {
    const injectStyle = new CodeBlockWriter();
    const iifeClientStyle = new CodeBlockWriter();
    iifeClientStyle.writeLine(`(`);

    iifeClientStyle.write('()=>').block(() => {
      iifeClientStyle.write(`if (typeof window === 'undefined')`).block(() => {
        iifeClientStyle.write(`return;`);
      });
      iifeClientStyle.write(injectClientStyle);
    });
    iifeClientStyle.write(')();');

    injectStyle.write(`(() => `).inlineBlock(() => {
      injectStyle.write(`if (typeof __expo_rsc_inject_module === 'function')`).space();
      injectStyle.block(() => {
        injectStyle.write(`__expo_rsc_inject_module(`);
        injectStyle
          .inlineBlock(() => {
            injectStyle.write('id: ').write(JSON.stringify(props.filename)).write(',');
            injectStyle
              .writeLine('code: ')
              .write(JSON.stringify(iifeClientStyle.toString()));
          })
          .write(');');
      });
      injectStyle.write(' else ').block(() => {
        injectStyle.write(
          `throw new Error('RSC SSR CSS injection function is not found (__expo_rsc_inject_module)');`,
        );
      });
    });
    injectStyle.writeLine(')();');
    console.log('RESULT: ', injectStyle.toString());
    return injectStyle.toString();
  }

  const iifeClientStyle = new CodeBlockWriter();
  iifeClientStyle.writeLine(`(`);
  iifeClientStyle.write('()=>').block(() => iifeClientStyle.write(injectClientStyle));
  iifeClientStyle.write(')();');

  return iifeClientStyle.toString();
}
