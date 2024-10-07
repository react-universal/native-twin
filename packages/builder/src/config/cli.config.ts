import * as Array from 'effect/Array';
import * as Config from 'effect/Config';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as ConfigFile from '@effect/cli/ConfigFile';
import * as Options from '@effect/cli/Options';
import * as Path from '@effect/platform/Path';

export const loadConfigFile = (searchPath: string) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const platformConfig = Config.literal('browser', 'node', 'neutral');
    const config = yield* pipe(
      Config.all({
        platform: platformConfig('platform').pipe(Config.withDefault('browser')),
        reactNative: Config.boolean('reactNative').pipe(Config.withDefault(false)),
        minify: Config.boolean('minify').pipe(Config.withDefault(false)),
        logs: Config.boolean('logs').pipe(Config.withDefault(false)),
        types: Config.boolean('types').pipe(Config.withDefault(true)),
        vscode: Config.boolean('vscode').pipe(Config.withDefault(false)),
        external: Config.array(Config.string(), 'external').pipe(
          Config.withDefault(Array.ensure('vscode')),
        ),
        entries: Config.array(Config.string(), 'entries').pipe(
          Config.withDefault(Array.ensure(path.join(searchPath, 'src/index.ts'))),
        ),
      }),
      Effect.provide(
        ConfigFile.layer('twin.config', {
          searchPaths: [path.join(searchPath)],
          formats: ['json'],
        }),
      ),
    );
    return config;
  });

const rn = Options.boolean('react-native').pipe(
  Options.withDefault(false),
  Options.withAlias('rn'),
  Options.optional,
);
const minify = Options.boolean('minify').pipe(
  Options.withDefault(false),
  Options.withAlias('min'),
  Options.optional,
);
const vscode = Options.boolean('vscode').pipe(
  Options.withDefault(false),
  Options.withAlias('vs'),
  Options.optional,
);
const platform = Options.choice('platform', ['neutral', 'node', 'browser']).pipe(
  Options.withAlias('p'),
  Options.optional,
);

export const CommandConfig = {
  configFile: Options.file('config').pipe(
    Options.withDefault('twin.config.json'),
    Options.withAlias('c'),
  ),
  watch: Options.boolean('watch').pipe(
    Options.withDefault(false),
    Options.withAlias('w'),
  ),
};
const watch = Options.boolean('watch').pipe(
  Options.withDefault(false),
  Options.withAlias('w'),
);

export const BuildConfig = { rn, minify, watch, vscode, platform };
