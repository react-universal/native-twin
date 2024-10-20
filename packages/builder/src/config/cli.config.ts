import * as Options from '@effect/cli/Options';

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
const watch = Options.boolean('watch').pipe(
  Options.withDefault(false),
  Options.withAlias('w'),
);

export const BuildConfig = { rn, minify, watch, vscode, platform, configFile };
