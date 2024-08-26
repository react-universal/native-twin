import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import type { __Theme__, RuntimeTW, TailwindConfig } from '@native-twin/core';
import type { CompilerContext } from '@native-twin/css/jsx';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import { BabelTransformerOptions } from '../models';
import { getUserTwinConfig, setupNativeTwin } from '../twin';

export class NativeTwinService extends Context.Tag('babel/twin-service')<
  NativeTwinService,
  {
    tw: RuntimeTW;
    config: TailwindConfig<__Theme__ & TailwindPresetTheme>;
    context: CompilerContext;
  }
>() {
  static make = (options: BabelTransformerOptions) =>
    Layer.scoped(
      NativeTwinService,
      Effect.gen(function* () {
        const platform = options.platform;
        const twinConfig = getUserTwinConfig(options.projectRoot, {
          engine: 'hermes',
          isDev: options.dev,
          isServer: options.platform === 'web',
          platform: options.platform,
        });
        const twin = setupNativeTwin(twinConfig, {
          engine: 'hermes',
          isDev: options.dev,
          isServer: options.platform === 'web',
          platform: options.platform,
        });

        return {
          tw: twin,
          config: twinConfig,
          context: {
            baseRem: twin.config.root.rem ?? 16,
            platform,
          },
        };
      }),
    );
}
