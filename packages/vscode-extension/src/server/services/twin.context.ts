import { Option, SubscriptionRef } from 'effect';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { RuntimeTW, TailwindConfig } from '@native-twin/core';


interface TwinState {
  tw: SubscriptionRef.SubscriptionRef<Option.Option<RuntimeTW>>;
  twConfig: SubscriptionRef.SubscriptionRef<Option.Option<TailwindConfig>>;
}
export class TwinContext extends Context.Tag('TwinContext')<TwinContext, TwinState>() {
  static readonly Live = Layer.scoped(
    TwinContext,
    Effect.gen(function* ($) {
      const tw = yield* $(SubscriptionRef.make<Option.Option<RuntimeTW>>(Option.none()));
      const twConfig = yield* $(
        SubscriptionRef.make<Option.Option<TailwindConfig>>(Option.none()),
      );

      return TwinContext.of({
        tw,
        twConfig,
      });
    }),
  );
}

