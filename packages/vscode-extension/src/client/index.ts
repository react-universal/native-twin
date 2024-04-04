import * as path from 'path';
import * as vscode from 'vscode';
import {
  LanguageClient,
  TransportKind,
  CloseAction,
  ErrorAction,
  LanguageClientOptions,
  ServerOptions,
} from 'vscode-languageclient/node';
import {
  DOCUMENT_SELECTORS,
  configurationSection,
  extensionChannelName,
} from '../internal/config';

const serverOptions: ServerOptions = {
  run: {
    module: path.resolve(__dirname, './server'),
    transport: TransportKind.ipc,
  },
  debug: {
    module: path.resolve(__dirname, './server'),
    transport: TransportKind.ipc,
    options: { execArgv: ['--nolazy', '--inspect=9229'] },
  },
};

// Get the workspace folder path
const workspaceFolders = vscode.workspace.workspaceFolders;
const workspaceRoot = workspaceFolders ? workspaceFolders[0]?.uri.fsPath : null;

const clientOptions: LanguageClientOptions = {
  documentSelector: DOCUMENT_SELECTORS,
  synchronize: {
    // TODO let users customize this
    // TODO ignore any files that are git-ignored like node_modules
    fileEvents: vscode.workspace.createFileSystemWatcher('**/*.{ts,tsx}'),
    configurationSection: configurationSection, // The configuration section the server wants to listen for
  },

  initializationOptions: {
    ...vscode.workspace.getConfiguration(configurationSection), // Pass the config to the server
    workspaceRoot,

    capabilities: {
      completion: {
        dynamicRegistration: false,
        completionItem: {
          snippetSupport: true,
        },
      },
    },
  },
  errorHandler: {
    error: () => {
      return {
        action: ErrorAction.Continue,
      };
    },
    closed: async () => {
      return {
        action: CloseAction.DoNotRestart,
      };
    },
  },
};

export const client = new LanguageClient(
  configurationSection,
  extensionChannelName,
  serverOptions,
  clientOptions,
);

client.debug('asd');
