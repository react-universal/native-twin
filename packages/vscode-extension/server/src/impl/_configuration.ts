export interface StyledPluginConfiguration {
  readonly tags: ReadonlyArray<string>;
  readonly validate: boolean;
}

export class ConfigurationManager {
  private static readonly defaultConfiguration: StyledPluginConfiguration = {
    tags: ['styled', 'css', 'extend', 'injectGlobal', 'createGlobalStyle', 'keyframes'],
    validate: true,
  };

  private readonly _configUpdatedListeners = new Set<() => void>();

  public get config(): StyledPluginConfiguration {
    return this._configuration;
  }
  private _configuration: StyledPluginConfiguration =
    ConfigurationManager.defaultConfiguration;

  public updateFromPluginConfig(config: StyledPluginConfiguration) {
    this._configuration = {
      tags: config.tags || ConfigurationManager.defaultConfiguration.tags,
      validate:
        typeof config.validate !== 'undefined'
          ? config.validate
          : ConfigurationManager.defaultConfiguration.validate,
    };

    for (const listener of this._configUpdatedListeners) {
      listener();
    }
  }

  public onUpdatedConfig(listener: () => void) {
    this._configUpdatedListeners.add(listener);
  }
}
