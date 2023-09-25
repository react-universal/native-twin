export class ConfigurationManager {
  private static defaultConfiguration = {
    tags: ['tw', 'apply', 'css', 'styled', 'variants'],
    attributes: ['tw', 'class', 'className', 'variants'],
    styles: ['style', 'styled'],
    debug: false,
    enable: true,
  };

  private readonly _configUpdatedListeners = new Set<() => void>();

  public get config() {
    return this._configuration;
  }

  private _configuration: (typeof ConfigurationManager)['defaultConfiguration'] = {
    ...ConfigurationManager.defaultConfiguration,
    tags: [...ConfigurationManager.defaultConfiguration.tags],
  };

  public updateFromPluginConfig(
    config: Partial<(typeof ConfigurationManager)['defaultConfiguration']> = {},
  ): void {
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
