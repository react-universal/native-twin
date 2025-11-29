import type { TwinConfigOptions } from '@native-twin/language-service';
import { LSPConfig, parseLSPConfigInput } from '@native-twin/language-service/Services';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import { glob } from 'glob';
import path from 'path';

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
  });

  function getInitialConfig(): Effect.Effect<Partial<TwinConfigOptions>> {
    const rootDir = process.cwd();
    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
    const initialConfig: Partial<TwinConfigOptions> = { rootDir, tsConfigPath };
    return Stream.fromAsyncIterable(
      glob.iterate(`${rootDir}/{tailwind,twin,nativeTwin,native-twin}.config.{ts,js,mjs,cjs}`, {
        maxDepth: 1,
        absolute: true,
        cwd: rootDir,
        includeChildMatches: false,
        nodir: true,
      }),
      (e) => new Error(`Glob async failed searching for twinConfigPath: ${e}`),
    ).pipe(
      Stream.runHead,
      Effect.map(
        Option.map((twinConfigPath) =>
          parseLSPConfigInput(Object.assign(initialConfig, { twinConfigPath })),
        ),
      ),
      Effect.map(Option.getOrElse(() => parseLSPConfigInput(initialConfig))),
      Effect.catchAll((error) =>
        Effect.logDebug(`Search for twinFile fails with: ${error}`).pipe(
          Effect.andThen(() => parseLSPConfigInput(initialConfig)),
        ),
      ),
    );
  }
}).pipe(Layer.effect(LSPConfig));
