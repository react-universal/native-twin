import type * as Option from 'effect/Option';
import type { Platform } from 'esbuild';

interface BuildConfigOptions {
  rn: Option.Option<boolean>;
  minify: Option.Option<boolean>;
  watch: Option.Option<boolean>;
  vscode: Option.Option<boolean>;
  platform: Option.Option<'neutral' | 'browser' | 'node'>;
}

interface TwinCliMainConfig {
  configFile: CliConfigFile;
  options: {
    watch: boolean;
  };
}

interface CliConfigFile {
  platform: Platform;
  reactNative: boolean;
  minify: boolean;
  logs: boolean;
  types: boolean;
  vscode: boolean;
  external: string[];
  entries: string[];
}

interface MakeLayersParams {
  configFile: string;
  watch: boolean;
}

export type { BuildConfigOptions, TwinCliMainConfig, CliConfigFile, MakeLayersParams };
