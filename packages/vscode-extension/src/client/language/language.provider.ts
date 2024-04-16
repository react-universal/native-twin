import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import path from 'path';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ErrorAction,
  CloseAction,
  TransportKind,
} from 'vscode-languageclient/node';
import {
  configurationSection,
  DOCUMENT_SELECTORS,
  extensionServerChannelName,
} from '../extension/extension.constants';
import { thenable } from '../extension/extension.utils';
import { LanguageClientContext } from './language.context';

export const LanguageClientLive = Layer.scoped(
  LanguageClientContext,
  Effect.gen(function* ($) {
    const workspace = vscode.workspace.workspaceFolders;

    const tsconfigFiles = yield* $(
      thenable(() => vscode.workspace.findFiles('**tsconfig.json', '', 1)),
    );

    const fileEvents = yield* $(
      Effect.acquireRelease(
        Effect.sync(() =>
          vscode.workspace.createFileSystemWatcher('**/*.{ts,tsx,js,jsx}'),
        ),
        (watcher) => Effect.sync(() => watcher.dispose()),
      ),
    );

    const serverConfig = {
      run: {
        module: path.resolve(__dirname, './server'),
        transport: TransportKind.ipc,
      },
      debug: {
        module: path.resolve(__dirname, '../../server'),
      },
    };

    const configFiles = yield* $(
      thenable(() =>
        vscode.workspace.findFiles(
          '**/tailwind.config.{ts,js,mjs,cjs}',
          '**/node_modules/**',
          1,
        ),
      ),
    );

    const clientConfig: LanguageClientOptions = {
      documentSelector: DOCUMENT_SELECTORS,
      synchronize: {
        // TODO let users customize this
        // TODO ignore any files that are git-ignored like node_modules
        fileEvents: fileEvents,
        configurationSection: configurationSection, // The configuration section the server wants to listen for
      },

      initializationOptions: {
        ...vscode.workspace.getConfiguration(configurationSection), // Pass the config to the server
        tsconfigFiles: tsconfigFiles,
        twinConfigFile: configFiles.at(0),
        workspaceRoot: workspace?.at(0),

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
            action: ErrorAction.Shutdown,
          };
        },
        closed: async () => {
          return {
            action: CloseAction.DoNotRestart,
          };
        },
      },
    };
    const client = new LanguageClient(
      extensionServerChannelName,
      serverConfig,
      clientConfig,
    );

    yield* $(Effect.promise(() => client.start()));

    yield* $(Effect.log('Language client started!'));

    return client;
  }),
);
