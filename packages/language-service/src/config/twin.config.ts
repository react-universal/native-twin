import * as Config from 'effect/Config';

export class TwinLanguageConfig {
  tsConfigPath: string;
  twinConfigPath: string;
  rootDir: string;
  jsxAttributes: string[];
  functions: string[];
  debug: boolean;
  enable: boolean;
  trace: { server: string };

  constructor(data: {
    tsConfigPath: string;
    twinConfigPath: string;
    rootDir: string;
    jsxAttributes: string[];
    functions: string[];
    debug: boolean;
    enable: boolean;
    trace: string;
  }) {
    this.tsConfigPath = data.tsConfigPath;
    this.twinConfigPath = data.twinConfigPath;
    this.rootDir = data.rootDir;
    this.jsxAttributes = data.jsxAttributes;
    this.functions = data.functions;
    this.debug = data.debug;
    this.enable = data.enable;
    this.trace = { server: data.trace };
  }
}

export const TwinRuntimeConfig = Config.all({
  twinConfigPath: Config.string('twinConfigPath').pipe(Config.withDefault('tailwind.config.ts')),
  tsConfigPath: Config.string('tsConfigPath').pipe(Config.withDefault('tsconfig.json')),
  rootDir: Config.string('rootDir').pipe(Config.withDefault('.')),
  jsxAttributes: Config.array(Config.string('jsxAttributes')).pipe(
    Config.withDefault<string[]>(['tw', 'class', 'className', 'variants']),
  ),
  functions: Config.array(Config.string('functions')).pipe(
    Config.withDefault<string[]>([
      'tw',
      'apply',
      'css',
      'variants',
      'style',
      'styled',
      'createVariants',
    ]),
  ),
  debug: Config.boolean('debug').pipe(Config.withDefault(false)),
  enable: Config.boolean('enable').pipe(Config.withDefault(true)),
  trace: Config.string('trace').pipe(Config.withDefault('off')),
}).pipe(Config.map((x) => new TwinLanguageConfig(x)));
