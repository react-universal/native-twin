// import { pipe } from 'effect';
// import * as Console from 'effect/Console';
// import { apply } from 'effect/Function';
// import fs from 'fs';
import worker from 'metro-transform-worker';
import path from 'path';
// import path from 'path';
import { NativeTwinTransformerOpts } from '@native-twin/babel/jsx-babel/models';
// import {
//   BabelTransformerService,
//   BabelTransformerServiceLive,
//   MetroCompilerContext,
//   NativeTwinService,
// } from '@native-twin/babel/jsx-babel/services';
import { ensureBuffer } from '../utils';

// import { MetroTransformerServiceLive } from './transformer.service';

export const transform = async (
  config: NativeTwinTransformerOpts,
  projectRoot: string,
  filename: string,
  data: Buffer | string,
  options: worker.JsTransformOptions,
): Promise<worker.TransformResponse> => {
  // pipe(
  //   Effect.gen(function* () {
  //     const ctx = yield* MetroCompilerContext;
  //     const transformer = yield* BabelTransformerService;
  //     const twin = yield* NativeTwinService;

  //     const useTransformer: TwinTransformFn = config.transformerPath
  //       ? require(config.transformerPath).transform
  //       : worker.transform;

  //     if (transformer.isCssFile(ctx.filename)) {
  //       yield* Console.log('CSS_FOUND', ctx.filename);
  //       const cssFilePath = path.join(ctx.options.projectRoot, ctx.filename);
  //       if (fs.existsSync(cssFilePath)) {
  //         yield* Console.log('MATCH_INPUT_CSS', ctx.filename);
  //       }
  //     }
  //     if (transformer.isNotAllowedPath(ctx.filename)) {
  //       return useTransformer(config, projectRoot, filename, data, options);
  //     }
  //     const cssContent = pipe(
  //       Option.liftPredicate(transformer.isCssFile),
  //       apply(ctx.filename),
  //       Option.flatMap(pipe(Option.liftPredicate(fs.existsSync))),
  //       Option.map((x) => fs.readFileSync(x).toString('utf-8')),
  //       Option.getOrElse(() => 'NO_CSS'),
  //     );
  //     const currentData = twin.tw.target;

  //     yield* Console.log('CSS_FILE: ', cssContent);
  //   }),
  //   Effect.provide(BabelTransformerServiceLive),
  //   Effect.provide(
  //     MetroCompilerContext.make(
  //       {
  //         filename,
  //         options: {
  //           dev: options.dev,
  //           hot: options.hot,
  //           inputCss: config.inputCss,
  //           platform: options.platform ?? 'ios',
  //           projectRoot: projectRoot,
  //           type: options.type,
  //         },
  //         src: ensureBuffer(data).toString('utf-8'),
  //       },
  //       {
  //         componentID: false,
  //         order: false,
  //         styledProps: false,
  //         templateStyles: false,
  //         tree: false,
  //       },
  //     ),
  //   ),
  //   Effect.provide(
  //     NativeTwinService.make({
  //       dev: options.dev,
  //       inputCss: config.inputCss,
  //       hot: options.hot,
  //       platform: options.platform ?? 'ios',
  //       projectRoot: projectRoot,
  //       type: options.type,
  //     }),
  //   ),

  //   Effect.runPromise,
  // );
  return worker.transform(
    // @ts-expect-error
    { ...config, inputCss: config.inputCss },
    projectRoot,
    filename,
    ensureBuffer(data),
    {
      ...options,
      customTransformOptions: {
        ...options.customTransformOptions,
        allowedFiles: config.allowedFiles,
        tailwindConfigPath: config.tailwindConfigPath,
        outputDir: config.outputDir,
        inputCss: config.inputCss,
      },
    },
  );
};
