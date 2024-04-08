import { ExtensionSettings } from '../../shared/extension.types';

interface ServerConfig {
  hasConfigurationCapability: boolean;
  hasWorkspaceFolderCapability: boolean;
  hasDiagnosticRelatedInformationCapability: boolean;
}

function createServerConfig() {
  let config = {
    hasConfigurationCapability: false,
    hasWorkspaceFolderCapability: false,
    hasDiagnosticRelatedInformationCapability: false,
  };

  return {
    get() {
      return config;
    },
    set(newConfig: ServerConfig) {
      config = {
        ...newConfig,
      };
    },
  };
}

function createGlobalSettings() {
  let currentSettings: ExtensionSettings = { maxNumberOfProblems: 1000 };

  return {
    get() {
      return currentSettings;
    },
    set(newConfig: ExtensionSettings) {
      currentSettings = {
        ...newConfig,
      };
    },
  };
}

function createDocumentSettings() {
  const documentSettings: Map<string, Promise<ExtensionSettings>> = new Map();

  return documentSettings;
}

export const serverConfig = createServerConfig();

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
export const globalSettings = createGlobalSettings();

// Cache the settings of all open documents
export const documentSettings = createDocumentSettings();
