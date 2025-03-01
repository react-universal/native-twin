import type { RuntimeTW, TailwindConfig, __Theme__ } from '@native-twin/core';
import type { SheetEntry } from '@native-twin/css';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import type { TwinPath } from '../FileSystem';

export type TwinRunnerPlatform = 'web' | 'native';

export type InternalTwinConfig = __Theme__ & TailwindPresetTheme;
export type InternalTwFn = RuntimeTW<InternalTwinConfig, SheetEntry[]>;
export interface ExtractedTwinConfig extends TailwindConfig<InternalTwinConfig> {
  content: TwinPath.FilePath[];
}
export type ImportedTwinConfig = TailwindConfig<InternalTwinConfig>;

import type * as LogLevel from 'effect/LogLevel';

/**
 * @domain `TwinNodeContext` Common Input config options
 */
export interface NodeWithNativeTwinOptions {
  /**
   * Must be absolute
   * @example ```js
   * __dirname
   * ```
   * */
  projectRoot?: string | undefined;
  /**
   * Must be absolute
   * @example ```js
   * path.join(__dirname, 'public/out.css')
   * ```
   * */
  outputDir?: string | undefined;
  twinConfigPath: string;
  /**
   * Must be absolute
   * @example ```js
   * path.join(__dirname, 'globals.css')
   * ```
   * */
  inputCSS?: string | undefined;
  /**
   * @default `INFO`
   * */
  logLevel: LogLevel.Literal;
}
