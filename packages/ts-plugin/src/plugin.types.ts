export interface NativeTwinPluginConfiguration {
  readonly configFile?: string;
  readonly tags: ReadonlyArray<string>;
  readonly attributes: ReadonlyArray<string>;
  readonly styles: ReadonlyArray<string>;
  readonly debug?: boolean;
  readonly enable: boolean;
}
