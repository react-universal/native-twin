import * as ConfigFile from '@effect/cli/ConfigFile';
import * as Options from '@effect/cli/Options';
import * as Path from '@effect/platform/Path';
import * as RA from 'effect/Array';
import * as Config from 'effect/Config';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import { CliBuildConfigInput } from './config.types';

const configFile = Options.file('config').pipe(
  Options.withDefault('twin.config.json'),
  Options.withAlias('c'),
);

export const CommandConfig = {
  configFile,
  watch: Options.boolean('watch').pipe(
    Options.withDefault(false),
    Options.withAlias('w'),
  ),
};

export const CliBuildOptions = {
  rn: Options.boolean('react-native').pipe(
    Options.withDefault(false),
    Options.withAlias('rn'),
    Options.optional,
  ),
  minify: Options.boolean('minify').pipe(
    Options.withDefault(false),
    Options.withAlias('min'),
    Options.optional,
  ),
  vscode: Options.boolean('vscode').pipe(
    Options.withDefault(false),
    Options.withAlias('vs'),
    Options.optional,
  ),
  platform: Options.choice('platform', ['neutral', 'node', 'browser']).pipe(
    Options.withAlias('p'),
    Options.optional,
  ),
  watch: Options.boolean('watch').pipe(
    Options.withDefault(false),
    Options.withAlias('w'),
  ),
  configFile,
};

export const makeBuilderConfig = (cliArgs: CliBuildConfigInput) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const platformConfig = Config.literal('browser', 'node');
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
