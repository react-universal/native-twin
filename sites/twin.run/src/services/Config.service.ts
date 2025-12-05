import { defineConfig } from '@native-twin/core';
import type { TwinConfigOptions } from '@native-twin/language-service';
import { LSPConfig, parseLSPConfigInput } from '@native-twin/language-service/browser';
import { presetTailwind } from '@native-twin/preset-tailwind';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import { createJiti } from 'jiti/native';

const factory = createJiti(import.meta.filename, {
  fsCache: false,
  debug: true,
  sourceMaps: false,
  rebuildFsCache: false,
  moduleCache: false,
  tryNative: false,
  interopDefault: false,
});

export const LSPConfigLive = Effect.gen(function* () {
  const currentConfig = yield* SubscriptionRef.make<TwinConfigOptions>(
    parseLSPConfigInput(yield* getInitialConfig()),
  );

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
    loadTwinConfig: (_filename) =>
      Effect.promise(() =>
        factory
          .import(_filename, { default: true, try: true })
          .then(Option.fromNullable)
          .catch(() => Option.none()),
      ).pipe(
        Effect.andThen(Option.getOrNull),
        Effect.map((x) =>
          x === null
            ? Option.some(
                defineConfig({
                  content: ['App.tsx'],
                  presets: [presetTailwind()],
                }) as unknown as any,
              )
            : Option.some(x),
        ),
      ),
  });

  function getInitialConfig(): Effect.Effect<Partial<TwinConfigOptions>> {
    const rootDir = './';
    const tsConfigPath = './tsconfig.json';
    const initialConfig: Partial<TwinConfigOptions> = { rootDir, tsConfigPath };
    return Effect.succeed(parseLSPConfigInput(initialConfig));
  }
}).pipe(Layer.effect(LSPConfig));
