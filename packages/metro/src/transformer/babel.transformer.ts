import { sheetEntriesToCss } from '@native-twin/css';
import upstreamTransformer from '@expo/metro-config/babel-transformer';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import { BabelLogger, transformJSXFile } from '@native-twin/babel/jsx-babel';
import { BabelTransformerFn } from '@native-twin/babel/jsx-babel/models';
import {
  BabelTransformerService,
  MetroCompilerContext,
  BabelTransformerServiceLive,
  NativeTwinService,
} from '@native-twin/babel/jsx-babel/services';

// import { formatCSS } from '../utils/formatCSS';

const mainProgram = Effect.gen(function* () {
  const ctx = yield* MetroCompilerContext;
  const transformer = yield* BabelTransformerService;
  const twin = yield* NativeTwinService;

  if (transformer.isNotAllowedPath(ctx.filename)) {
    return ctx.code;
  }

  const restore = twin.tw.snapshot();
  const compiled = yield* transformJSXFile(ctx.code);

  if (ctx.platform === 'web' && compiled.classNames !== '') {
    // const entries = `require('@native-twin/core').tw(\`${compiled.classNames}\`);`;
    const runtime = `
    (() => {
      
      if (typeof window === 'undefined') {
        const __inject_1 = require("@native-twin/core");
        if (!__inject_1.tw.config) {
          console.log("NO_CONFIG: ", ${JSON.stringify(ctx.filename)});
        } else {
         console.log("TARGET_LENGTH: ", __inject_1.tw.target?.length);
        __inject_1.tw(\`${compiled.classNames}\`);
        }
        return
      }
      const __inject_1 = require("@native-twin/core");
      if (!__inject_1.tw.config) {
        console.log("NO_CONFIG: ", ${JSON.stringify(ctx.filename)});
      } else {
        console.log("TARGET_LENGTH: ", __inject_1.tw.target?.length);
        __inject_1.tw(\`${compiled.classNames}\`);
      }

      const previousStyle = document.querySelector('[data-native-twin=""]') ?? 
                            document.querySelector('[data-native-twin="claimed"]');
        if (previousStyle) {
          previousStyle.appendChild(
            document.createTextNode(
              ${JSON.stringify(sheetEntriesToCss(twin.tw.target, true))}
            )
          );
        }
    })();
    `;
    // console.log('RESULT: ', runtime);

    compiled.generated = `${compiled.generated}\n${runtime}`;
  } else {
    console.log('NO_WEB', {
      emptyClasses: compiled.classNames === '',
      file: ctx.filename,
    });
  }

  // if (twin.tw.target.length > 0) {
  //   fs.writeFileSync(ctx.cssOutput, compiled.cssResult.outString);
  // }
  restore();

  return compiled.generated;
});

export function pathToHtmlSafeName(path: string) {
  return path.replace(/[^a-zA-Z0-9_]/g, '_');
}

const MainLayer = BabelTransformerServiceLive.pipe(
  Layer.merge(Logger.replace(Logger.defaultLogger, BabelLogger)),
);

export const babelRunnable = Effect.scoped(
  mainProgram.pipe(Logger.withMinimumLogLevel(LogLevel.All), Effect.provide(MainLayer)),
);

export const transform: BabelTransformerFn = async (params) => {
  // console.log(inspect(params.options, false, null, true));
  return babelRunnable.pipe(
    Effect.provide(
      MetroCompilerContext.make(params, {
        componentID: true,
        styledProps: true,
        templateStyles: true,
        tree: true,
        order: true,
      }),
    ),
    Effect.provide(NativeTwinService.make(params.options)),
    Effect.map((code) => {
      // @ts-expect-error
      return upstreamTransformer.transform({
        src: code,
        options: params.options,
        filename: params.filename,
      });
    }),
    Effect.runPromise,
  );
};
