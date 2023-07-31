import {
  createConnection,
  ProposedFeatures,
  TextDocumentSyncKind,
  InitializeResult,
  InitializeParams,
  DidChangeConfigurationNotification,
  DidChangeConfigurationParams,
} from 'vscode-languageserver/node';
import { globalConfig } from './_config-manager';
import { documents } from './_document-provider';
import { EXTENSION_IDENTIFIER } from './constants/config.constants';

function createConnectionManager() {
  // Create a connection for the server, using Node's IPC as a transport.
  // Also include all preview / proposed LSP features.
  const connection = createConnection(ProposedFeatures.all);
  connection.onInitialize(_onInitialize);
  connection.onInitialized(_onInitialized);

  return connection;

  function _onInitialize(params: InitializeParams) {
    const capabilities = params.capabilities;

    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
    globalConfig.setInternalConfig({
      hasConfigurationCapability: !!(
        capabilities.workspace && !!capabilities.workspace.configuration
      ),
      hasWorkspaceFolderCapability: !!(
        capabilities.workspace && !!capabilities.workspace.workspaceFolders
      ),
      hasDiagnosticRelatedInformationCapability: !!(
        capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation
      ),
    });

    serverConnection.onDidChangeConfiguration(_onDidChangeConfiguration);

    const result: InitializeResult = {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        // Tell the client that this server supports code completion.
        completionProvider: {
          resolveProvider: true,
        },
      },
    };
    if (globalConfig.internalConfig.hasWorkspaceFolderCapability) {
      result.capabilities.workspace = {
        workspaceFolders: {
          supported: true,
        },
      };
    }
    return result;
  }

  function _onInitialized() {
    if (globalConfig.internalConfig.hasConfigurationCapability) {
      // Register for all configuration changes.
      serverConnection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
    if (globalConfig.internalConfig.hasWorkspaceFolderCapability) {
      serverConnection.workspace.onDidChangeWorkspaceFolders((_event) => {
        serverConnection.console.log('Workspace folder change event received.');
      });
    }
  }

  function _onDidChangeConfiguration(change: DidChangeConfigurationParams) {
    if (globalConfig.internalConfig.hasConfigurationCapability) {
      // Reset all cached document settings
      documents.documentSettings.clear();
    } else {
      globalConfig.setExtensionSettings({
        ...(change.settings[EXTENSION_IDENTIFIER] || globalConfig.extensionSettings),
      });
    }
  }
}

export const serverConnection = createConnectionManager();
