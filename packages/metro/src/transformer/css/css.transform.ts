/* eslint-disable no-control-regex */
// import * as Console from 'effect/Console';
// import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import worker, { type TransformResponse } from 'metro-transform-worker';
// import { pipe } from 'effect/Function';
// @ts-expect-error
import countLines from 'metro/src/lib/countLines';
import { pathToHtmlSafeName } from '@native-twin/helpers/server';
// import postcss from 'postcss';
// import { sheetEntriesToCss } from '@native-twin/css';
import { MetroWorkerService } from '../../services/MetroWorker.service';
import type { ExpoJsOutput } from '@expo/metro-config/build/serializer/jsOutput';

export const transformCSS = Effect.gen(function* () {
  const { config, input, readCSSOutput } = yield* MetroWorkerService;

  if (!config.isWeb) {
    return Option.none() as Option.Option<TransformResponse>;
  }

  const { transform: lightningcssTransform } =
    // @ts-expect-error
    require('lightningcss') as typeof import('lightningcss');

  const output = yield* readCSSOutput;
  if (output.length === 0) {
    return Option.none();
  }

  const cssResult = lightningcssTransform({
    code: Buffer.from(output),
    filename: config.cssOutput,
    cssModules: false,
    minify: false,
  });

  const jsModuleResults = yield* Effect.promise(() => {
    return worker.transform(
      input.config,
      input.projectRoot,
      input.filename,
      input.options.dev
        ? Buffer.from(
            wrapDevelopmentCSS({
              src: input.data.toString('utf-8'),
              filename: input.filename,
              reactServer: config.isReactServer,
            }),
          )
        : Buffer.from(''),
      input.options,
    );
  });

  // console.log('jsModuleResults: ', inspect(jsModuleResults, false, null, true));

  const cssCode = cssResult.code.toString();

  // yield* Console.log('CSS_CODE: ', cssCode);

  const outputCode: ExpoJsOutput[] = [
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
          skipCache: false,
        },
      },
    },
  ];

  return Option.some({
    dependencies: jsModuleResults.dependencies,
    output: outputCode,
  }) as Option.Option<TransformResponse>;
});

export function getHotReplaceTemplate(id: string) {
  // In dev mode, we need to replace the style tag instead of appending it
  // use the path as the expo-css-hmr attribute to find the style tag
  // to replace.
  const attr = JSON.stringify(pathToHtmlSafeName(id));
  return `style.setAttribute('data-expo-css-hmr', ${attr});
  style.setAttribute('data-native-twin', "");
  const previousStyle = document.querySelector('[data-expo-css-hmr=${attr}]');
  if (previousStyle) {
    previousStyle.parentNode.removeChild(previousStyle);
  }`;
}

export function wrapDevelopmentCSS(props: {
  src: string;
  filename: string;
  reactServer: boolean;
}) {
  const withBackTicksEscaped = escapeBackticksAndOctals(props.src);

  const injectClientStyle = `const head = document.head || document.getElementsByTagName('head')[0];
const style = document.createElement('style');
${getHotReplaceTemplate(props.filename)}
style.setAttribute('data-expo-loader', 'css');
head.appendChild(style);
const css = \`${withBackTicksEscaped}\`;
if (style.styleSheet){
  style.styleSheet.cssText = css;
} else {
  style.appendChild(document.createTextNode(css));
}`;

  // When bundling React Server Components, add an iife which will broadcast the client JS script to the root client bundle.
  // This will ensure the global CSS is available in the browser in development.
  if (props.reactServer) {
    const injectStyle = `
    (()=>{${injectClientStyle}})();`;
    return injectStyle;
  }

  const injectStyle = `(() => {
if (typeof window === 'undefined') {
  // const __inject_1 = require("@native-twin/core");
  // const __a_config = require("../../../tailwind.config");
  // __inject_1.install(__inject_1.defineConfig(__a_config));
  return
}
${injectClientStyle}
})();`;

  return injectStyle;
}

export function escapeBackticksAndOctals(str: string) {
  if (typeof str !== 'string') {
    return '';
  }

  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/[\0-\x07]/g, (match) => `\\0${match.charCodeAt(0).toString(8)}`);
}

// if (ctx.platform === 'web') {
//   const parsedCSS = yield* transformCSS;
//   pipe(
//     trees,
//     HashMap.findFirst((x) => x.leave.leave.value.cssImports.length > 0),
//     Option.map(() => {
//       console.log('FOUND!', parsedCSS.code);
//       fs.writeFileSync(parsedCSS.outputFile, parsedCSS.code);
//     }),
//   );
// }

/** For web */
export const getRuntimeCSS = () => {
  //   const runtime = `
  // (() => {
  //   if (typeof window === 'undefined') {
  //     const __inject_1 = require("@native-twin/core");
  //     if (!__inject_1.tw.config) {
  //       console.log("NO_CONFIG: ", ${JSON.stringify(ctx.filename)});
  //     } else {
  //      console.log("TARGET_LENGTH: ", __inject_1.tw.target?.length);
  //     __inject_1.tw(\`${compiled.classNames}\`);
  //     }
  //     return
  //   }
  //   const __inject_1 = require("@native-twin/core");
  //   if (!__inject_1.tw.config) {
  //     console.log("NO_CONFIG: ", ${JSON.stringify(ctx.filename)});
  //   } else {
  //     console.log("TARGET_LENGTH: ", __inject_1.tw.target?.length);
  //     __inject_1.tw(\`${compiled.classNames}\`);
  //   }
  //   const previousStyle = document.querySelector('[data-native-twin=""]') ??
  //                         document.querySelector('[data-native-twin="claimed"]');
  //     if (previousStyle) {
  //       previousStyle.appendChild(
  //         document.createTextNode(
  //           ${JSON.stringify(sheetEntriesToCss(twin.tw.target, true))}
  //         )
  //       );
  //     }
  // })();
  // `;
  // compiled.generated = `${compiled.generated}`;
};
