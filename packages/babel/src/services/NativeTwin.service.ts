import type { Preflight } from '@native-twin/css';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import type { __Theme__, TailwindConfig } from '@native-twin/core';
import type { CompilerContext } from '@native-twin/css/jsx';
import { getUserTwinConfig, setupNativeTwin } from '../jsx/twin';
import type { InternalTwFn, InternalTwinConfig } from '../types/twin.types';

export class NativeTwinService extends Context.Tag('babel/twin-service')<
  NativeTwinService,
  {
    tw: InternalTwFn;
    config: TailwindConfig<InternalTwinConfig>;
    context: CompilerContext;
    preflight: Preflight;
  }
>() {
  static make = (options: { platform: string; projectRoot: string; dev: boolean }) =>
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
        // console.log('DEFINED_PREFLIGHT: ', twinConfig.preflight);
        const preflight = {};
        if (options.platform === 'web') {
          twinConfig.mode = 'web';
        }
        // twinConfig.preflight = {};
        const twin = setupNativeTwin(twinConfig, {
          engine: 'hermes',
          isDev: options.dev,
          isServer: options.platform === 'web',
          platform: options.platform,
        });

        return {
          tw: twin,
          config: twinConfig,
          preflight,
          context: {
            baseRem: twin.config.root.rem ?? 16,
            platform,
          },
        };
      }),
    );
}
