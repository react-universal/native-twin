import * as Effect from 'effect/Effect';
import type {
  GetTransformOptions,
  ExtraTransformOptions,
  GetTransformOptionsOpts,
} from 'metro-config';
import type { MetroConfigService } from '../MetroConfig.service';

export const metroConfigGetTransformerOptions =
  (
    originalGetTransformOptions: GetTransformOptions,
    userConfig: MetroConfigService['Type']['userConfig'],
  ) =>
  (...args: Parameters<GetTransformOptions>) =>
    Effect.gen(function* () {
      const [filename, config, getDeps] = args;
      console.log('GET_FOR: ', config);
      const newConfig: GetTransformOptionsOpts = {
        ...config,
        // @ts-expect-error
        customTransformerOption: {
          inputCSS: userConfig.inputCSS,
          outputCss: userConfig.outputCSS,
        },
        inputCSS: userConfig.inputCSS,
        outputCSS: userConfig.outputCSS,
      };
      const original = yield* Effect.promise(() =>
        originalGetTransformOptions(filename, newConfig, getDeps),
      );
      // const result = yield* pipe(
      //   filename,
      //   Array.map((x) => Effect.promise(() => getDeps(x))),
      //   Effect.all,
      // );
      console.log('RESULT_DEPS: ', original);
      return {
        ...original,
        transform: {
          ...original.transform,
          inputCSS: userConfig.inputCSS,
          outputCSS: userConfig.outputCSS,
        },
      } as Partial<ExtraTransformOptions>;
    });
