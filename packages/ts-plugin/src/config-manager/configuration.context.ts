import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import { TailwindPluginConfiguration } from '../old/language-service/configuration';

export class ConfigurationContext extends Context.Tag('config/context')<
  ConfigurationContext,
  {
    readonly config: SubscriptionRef.SubscriptionRef<TailwindPluginConfiguration>;
    readonly pluginName: string;
  }
>() {}

export const ConfigurationLive = Layer.scoped(
  ConfigurationContext,
  Effect.gen(function* ($) {
    const ref = yield* $(
      SubscriptionRef.make<TailwindPluginConfiguration>({
        tags: ['tw', 'apply', 'css', 'styled', 'variants'],
        attributes: ['tw', 'class', 'className', 'variants'],
        styles: ['style', 'styled'],
        debug: false,
        enable: true,
      }),
    );

    return {
      config: ref,
      pluginName: 'native-twin-ts-plugin',
    };
  }),
);
