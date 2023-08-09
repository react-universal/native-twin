import {
  InitializeParams,
  TextDocumentSyncKind,
  InitializeResult,
  Connection,
  DidChangeConfigurationNotification,
} from 'vscode-languageserver/node';
import { globalStore } from './storage';

export function onInitializeConnection(params: InitializeParams) {
  const capabilities = params.capabilities;
  globalStore.setState((prevState) => ({
    ...prevState,
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
  }));
  const currentState = globalStore.getState();

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
      },
    },
  };
  if (currentState.hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }
  return result;
}

export function onConnectionInitialized(connection: Connection) {
  const currentState = globalStore.getState();
  if (currentState.hasConfigurationCapability) {
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
  if (currentState.hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event) => {
      connection.console.log('Workspace folder change event received.');
    });
  }
}
