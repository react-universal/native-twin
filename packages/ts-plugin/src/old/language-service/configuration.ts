export interface TailwindPluginConfiguration {
  readonly configFile?: string;
  readonly tags: ReadonlyArray<string>;
  readonly attributes: ReadonlyArray<string>;
  readonly styles: ReadonlyArray<string>;
  readonly debug?: boolean;
  readonly enable: boolean;
}

export class ConfigurationManager {
  static readonly pluginName = 'native-twin-ts-plugin';
  private static readonly defaultConfiguration: TailwindPluginConfiguration = {
    tags: ['tw', 'apply', 'css', 'styled', 'variants'],
    attributes: ['tw', 'class', 'className', 'variants'],
    styles: ['style', 'styled'],
    debug: false,
    enable: true,
  };

  private readonly _configUpdatedListeners = new Set<() => void>();

  public get config(): TailwindPluginConfiguration {
    return this._configuration;
  }

  private _configuration: TailwindPluginConfiguration = {
    ...ConfigurationManager.defaultConfiguration,
    tags: [...ConfigurationManager.defaultConfiguration.tags],
  };

  public updateFromPluginConfig(config: Partial<TailwindPluginConfiguration> = {}): void {
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
