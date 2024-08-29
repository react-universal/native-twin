import upstreamTransformer from '@expo/metro-config/babel-transformer';
import * as Console from 'effect/Console';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import fs from 'fs';
import path from 'path';
import { inspect } from 'util';
import { BabelLogger, babelTraverseCode } from '@native-twin/babel/jsx-babel';
import { BabelTransformerFn } from '@native-twin/babel/jsx-babel/models';
import {
  BabelTransformerService,
  MetroCompilerContext,
  BabelTransformerServiceLive,
  NativeTwinService,
} from '@native-twin/babel/jsx-babel/services';
import { sheetEntriesToCss, SheetEntry } from '@native-twin/css';

const mainProgram = Effect.gen(function* () {
  const ctx = yield* MetroCompilerContext;
  const transformer = yield* BabelTransformerService;
  const twin = yield* NativeTwinService;

  if (transformer.isNotAllowedPath(ctx.filename)) {
    if (transformer.isCssFile(ctx.filename)) {
      const inputName = path.basename(ctx.inputCss);
      const fileName = path.basename(ctx.filename);
      if (inputName === fileName) {
        yield* Console.log('FOUND_CSS_FILE', ctx.inputCss);
        const filePath = path.join(ctx.options.projectRoot, ctx.filename);
        if (fs.existsSync(filePath)) {
          yield* Console.log('AND_EXISTS!');
          // fs.writeFileSync(filePath, sheetEntriesToCss(twin.tw.target as SheetEntry[]));
          ctx.code = sheetEntriesToCss(twin.tw.target as SheetEntry[]);
        }
      } else {
        yield* Console.log('NO_MATCH_CSS_FILE', {
          input: ctx.inputCss,
          file: ctx.filename,
        });
      }
    }
    return ctx.code;
  }

  const compiled = yield* babelTraverseCode(ctx.code);
  const css = sheetEntriesToCss(twin.tw.target as SheetEntry[]);
  const cssPath = path.join(
    ctx.options.projectRoot ?? '',
    ctx.options.customTransformOptions.routerRoot ?? '',
    ctx.inputCss,
  );
  if (fs.existsSync(cssPath)) {
    yield* Console.log('AND_EXISTS!');
    // fs.writeFileSync(filePath, sheetEntriesToCss(twin.tw.target as SheetEntry[]));
    ctx.code = sheetEntriesToCss(twin.tw.target as SheetEntry[]);
  }

  return compiled.generated;
});

const MainLayer = BabelTransformerServiceLive.pipe(
  Layer.merge(Logger.replace(Logger.defaultLogger, BabelLogger)),
);

export const babelRunnable = Effect.scoped(
  mainProgram.pipe(Logger.withMinimumLogLevel(LogLevel.All), Effect.provide(MainLayer)),
);

export const transform: BabelTransformerFn = async (params) => {
  console.log(inspect(params.options, false, null, true));
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
    Effect.map((code) =>
      // @ts-expect-error
      upstreamTransformer.transform({
        src: code,
        options: params.options,
        filename: params.filename,
      }),
    ),
    Effect.runPromise,
  );
};
