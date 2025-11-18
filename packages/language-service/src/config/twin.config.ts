import * as Config from 'effect/Config';
import * as ConfigProvider from 'effect/ConfigProvider';
import * as Layer from 'effect/Layer';
import { ts as typescript } from 'ts-morph';

export interface TwinLanguageConfigOptions {
  tsConfigPath: string;
  twinConfigPath: string;
  rootDir: string;
  jsxAttributes: string[];
  functions: string[];
  debug: boolean;
  enable: boolean;
  trace: string;
}

export class TwinLanguageConfig {
  tsConfigPath: string;
  twinConfigPath: string;
  rootDir: string;
  jsxAttributes: string[];
  functions: string[];
  debug: boolean;
  enable: boolean;
  trace: { server: string };

  constructor(data: TwinLanguageConfigOptions) {
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
  twinConfigPath: Config.string('twinConfigPath'),
  tsConfigPath: Config.string('tsConfigPath'),
  rootDir: Config.string('rootDir'),
  jsxAttributes: Config.array(Config.string(), 'jsxAttributes'),
  functions: Config.array(Config.string(), 'functions'),
  debug: Config.boolean('debug'),
  enable: Config.boolean('enable'),
  trace: Config.string('trace'),
}).pipe(Config.map((x) => new TwinLanguageConfig(x)));

export const withRuntimeConfig = (input: Partial<TwinLanguageConfigOptions>) => {
  const rootDir = input.rootDir ?? typescript.sys.getCurrentDirectory();
  const twinConfigPath = input.twinConfigPath ?? rootDir.concat('/tailwind.config.ts');
  const tsConfigPath = input.tsConfigPath ?? rootDir.concat('/tsconfig.json');
  const config: TwinLanguageConfigOptions = {
    twinConfigPath,
    tsConfigPath,
    rootDir,
    jsxAttributes: input.jsxAttributes ?? ['tw', 'class', 'className', 'variants'],
    functions: input.functions ?? [
      'tw',
      'apply',
      'css',
      'variants',
      'style',
      'styled',
      'createVariants',
    ],
    debug: !!input.debug,
    enable: input.enable ? input.enable : true,
    trace: input.trace ?? 'off',
  };

  return Layer.setConfigProvider(ConfigProvider.fromJson(config));
};
