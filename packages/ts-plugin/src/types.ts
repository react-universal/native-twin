import type { BaseTheme, TwindConfig } from '@twind/core';
import type { TailwindTheme } from '@universal-labs/twind-adapter';

export type CurrentTheme = BaseTheme & TailwindTheme;
export type TailwindConfig = TwindConfig<CurrentTheme>;

export interface TwindPluginConfiguration {
  readonly configFile?: string;
  readonly tags: ReadonlyArray<string>;
  readonly attributes: ReadonlyArray<string>;
  readonly styles: ReadonlyArray<string>;
  readonly debug?: boolean;
  readonly enable: boolean;
}
