import * as Option from 'effect/Option';
import esbuild from 'esbuild';

export interface BuildConfigOptions {
  rn: Option.Option<boolean>;
  minify: Option.Option<boolean>;
  watch: Option.Option<boolean>;
  vscode: Option.Option<boolean>;
  platform: Option.Option<'neutral' | 'browser' | 'node'>;
}
export interface CliConfigFile {
  platform: esbuild.Platform;
  reactNative: boolean;
  minify: boolean;
  logs: boolean;
  types: boolean;
  vscode: boolean;
  external: string[];
  entries: string[];
}

export interface MakeLayersParams {
  configFile: string;
  watch: boolean;
}

export interface TwinCliMainConfig {
  configFile: CliConfigFile;
  options: {
    watch: boolean;
  };
}
