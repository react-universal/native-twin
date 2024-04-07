import {
  createConnection,
  ProposedFeatures,
  DidChangeConfigurationNotification,
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node';
import { serverConfig } from '../config/server.config';
import { setConfigCapabilities } from './connection.effects';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const serverConnection = createConnection(ProposedFeatures.all);

serverConnection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;
  serverConfig.set(setConfigCapabilities(capabilities));

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
      },
      diagnosticProvider: {
        interFileDependencies: false,
        workspaceDiagnostics: false,
      },
    },
  };
  if (serverConfig.get().hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }
  return result;
});

serverConnection.onInitialized(() => {
  const { hasConfigurationCapability, hasWorkspaceFolderCapability } = serverConfig.get();
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    serverConnection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
  if (hasWorkspaceFolderCapability) {
    serverConnection.workspace.onDidChangeWorkspaceFolders(() => {
      serverConnection.console.log('Workspace folder change event received.');
    });
  }
});

serverConnection.onDidChangeConfiguration((change) => {
  const { hasConfigurationCapability } = serverConfig.get();
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = (change.settings.languageServerExample ||
      defaultSettings) as ExampleSettings;
  }
  connection.languages.diagnostics.refresh();
});
