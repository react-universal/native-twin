export interface TwindPluginConfiguration {
  readonly configFile?: string;
  readonly tags: ReadonlyArray<string>;
  readonly attributes: ReadonlyArray<string>;
  readonly styles: ReadonlyArray<string>;
  readonly debug?: boolean;
  readonly enable: boolean;
}

export class ConfigurationManager {
  static readonly pluginName = 'ts-styled-plugin-tw';
  static readonly VARIANT_MARKER_RULE = /^…$/;
  private static readonly defaultConfiguration: TwindPluginConfiguration = {
    tags: ['tw', 'apply', 'css', 'styled', 'variants'],
    attributes: ['tw', 'class', 'className', 'variants'],
    styles: ['style', 'styled'],
    debug: false,
    enable: true,
  };

  private readonly _configUpdatedListeners = new Set<() => void>();

  public get config(): TwindPluginConfiguration {
    return this._configuration;
  }

  private _configuration: TwindPluginConfiguration = {
    ...ConfigurationManager.defaultConfiguration,
    tags: [...ConfigurationManager.defaultConfiguration.tags],
  };

  public updateFromPluginConfig(config: Partial<TwindPluginConfiguration> = {}): void {
    const mergedConfig = {
      ...ConfigurationManager.defaultConfiguration,
      ...config,
    };

    this._configuration = {
      ...mergedConfig,
      debug: 'true' == String(mergedConfig.debug),
      enable: 'false' != String(mergedConfig.enable),
    };

    for (const listener of this._configUpdatedListeners) {
      listener();
    }
  }

  public onUpdatedConfig(listener: () => void): void {
    this._configUpdatedListeners.add(listener);
  }
}
