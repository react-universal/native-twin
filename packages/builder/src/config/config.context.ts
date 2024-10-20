import * as ConfigFile from '@effect/cli/ConfigFile';
import * as Path from '@effect/platform/Path';
import * as RA from 'effect/Array';
import * as Config from 'effect/Config';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import { MakeLayersParams } from './config.types';

const make = (cliArgs: MakeLayersParams) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const platformConfig = Config.literal('browser', 'node', 'neutral');
    const rootDir = path.dirname(cliArgs.configFile);
    const config = yield* pipe(
      Config.all({
        platform: platformConfig('platform').pipe(Config.withDefault('browser')),
        reactNative: Config.boolean('reactNative').pipe(Config.withDefault(false)),
        minify: Config.boolean('minify').pipe(Config.withDefault(false)),
        logs: Config.boolean('logs').pipe(Config.withDefault(false)),
        types: Config.boolean('types').pipe(Config.withDefault(true)),
        vscode: Config.boolean('vscode').pipe(Config.withDefault(false)),
        external: Config.array(Config.string(), 'external').pipe(
          Config.withDefault(RA.ensure('vscode')),
        ),
        entries: Config.array(Config.string(), 'entries').pipe(
          Config.withDefault(RA.ensure(path.join(rootDir, 'src/index.ts'))),
        ),
        watch: Config.boolean('watch').pipe(Config.withDefault(cliArgs.watch)),
      }),
      Effect.provide(
        ConfigFile.layer('twin.config', {
          searchPaths: [rootDir],
          formats: ['json'],
        }),
      ),
    );

    return config;
  });

export class BuilderConfig extends Effect.Tag('bundler/config')<
  BuilderConfig,
  Effect.Effect.Success<ReturnType<typeof make>>
>() {
  static Live = (cliArgs: MakeLayersParams) => Layer.scoped(BuilderConfig, make(cliArgs));
}
