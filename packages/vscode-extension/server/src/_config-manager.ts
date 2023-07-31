interface InternalConfig {
  hasConfigurationCapability: boolean;
  hasWorkspaceFolderCapability: boolean;
  hasDiagnosticRelatedInformationCapability: boolean;
}

// The example settings
export interface ExtensionSettings {
  maxNumberOfProblems: number;
}

function createConfigManager() {
  let internalConfig: InternalConfig = {
    hasConfigurationCapability: false,
    hasWorkspaceFolderCapability: false,
    hasDiagnosticRelatedInformationCapability: false,
  };
  let extensionSettings: ExtensionSettings = { maxNumberOfProblems: 1000 };

  return {
    internalConfig,
    setInternalConfig,
    extensionSettings,
    setExtensionSettings,
  };

  function setExtensionSettings(settings: Partial<ExtensionSettings>) {
    extensionSettings = {
      ...extensionSettings,
      ...settings,
    };
  }

  function setInternalConfig(newConfig: Partial<InternalConfig>) {
    internalConfig = {
      ...internalConfig,
      ...newConfig,
    };
  }
}

export const globalConfig = createConfigManager();
