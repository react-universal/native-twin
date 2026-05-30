import {
  type InternalTwinConfig,
  LSPConfig,
  parseLSPConfigInput,
  type TwinConfigOptions,
} from '@native-twin/language-service';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import type * as Option from 'effect/Option';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import { requireESM } from '../utils/load-esm';

export const LSPConfigLive = Effect.gen(function* () {
  const currentConfig = yield* SubscriptionRef.make<TwinConfigOptions>(parseLSPConfigInput({}));

  const configSelector = <T>(selector: (config: TwinConfigOptions) => T) =>
    currentConfig.get.pipe(Effect.map((x) => selector(x)));

  const onChangeConfig = (newConfig: TwinConfigOptions) =>
    SubscriptionRef.setAndGet(currentConfig, newConfig);

  return LSPConfig.of({
    config: currentConfig,
    onChangeConfig,
    configSelector,
    loadTwinConfig: (filename): Effect.Effect<Option.Option<InternalTwinConfig>> =>
      Effect.promise(() => requireESM<InternalTwinConfig>(filename)).pipe(
        // Effect.catchAll(() => Option.none<InternalTwinConfig>()),
      ),
  });
}).pipe(Layer.effect(LSPConfig));

// const quickSort = (target: number[]) => {
//   if (target.length <= 1) return target;
//   const pivot = target[target.length -1];
//   const leftRes: number[] = [];
//   const rightRes: number[] = [];
//   for (let i=0;i<target.length-1;i++) {
//     if (target[i] < pivot) {
//       leftRes.push(target[1]);
//     } else {
//       rightRes.push(target[1]);
//     }
// }
// return [...quickSort(leftRes), pivot, ...quickSort(rightRes)]
// }
