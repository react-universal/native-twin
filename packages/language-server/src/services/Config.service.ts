import {
  LSPConfig,
  parseLSPConfigInput,
  requireESM,
  type TwinConfigOptions,
} from '@native-twin/language-service';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as SubscriptionRef from 'effect/SubscriptionRef';

export const LSPConfigLive = Effect.gen(function* () {
  const currentConfig = yield* SubscriptionRef.make<TwinConfigOptions>(parseLSPConfigInput({}));

  const configSelector = <T>(selector: (config: TwinConfigOptions) => T) =>
    currentConfig.get.pipe(Effect.map((x) => selector(x)));

  const onChangeConfig = (newConfig: TwinConfigOptions) =>
    SubscriptionRef.setAndGet(currentConfig, newConfig).pipe(
      Effect.tap(() => Effect.log('LSPConfig changed.')),
    );

  return LSPConfig.of({
    config: currentConfig,
    onChangeConfig,
    configSelector,
    loadTwinConfig: (filename) => Effect.promise(() => requireESM(filename)),
  });
}).pipe(Layer.effect(LSPConfig));
