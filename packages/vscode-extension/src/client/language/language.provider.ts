import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ErrorAction,
  CloseAction,
} from 'vscode-languageclient/node';
import {
  configurationSection,
  DOCUMENT_SELECTORS,
  extensionServerChannelName,
} from '../../internal/config';
import {
  ClientLanguageOptionsContext,
  LanguageClientContext,
  ServerLanguageOptionsContext,
} from './language.context';

export const LanguageClientLive = Layer.effect(
  LanguageClientContext,
  Effect.gen(function* (_) {
    const clientOptions = yield* _(ClientLanguageOptionsContext);
    const serverOptions = yield* _(ServerLanguageOptionsContext);
    const clientConfig: LanguageClientOptions = {
      documentSelector: DOCUMENT_SELECTORS,
      synchronize: {
        // TODO let users customize this
        // TODO ignore any files that are git-ignored like node_modules
        fileEvents: vscode.workspace.createFileSystemWatcher('**/*.{ts,tsx}'),
        configurationSection: configurationSection, // The configuration section the server wants to listen for
      },

      initializationOptions: {
        ...vscode.workspace.getConfiguration(configurationSection), // Pass the config to the server
        workspaceRoot: clientOptions.workspaceRoot.pipe(Option.getOrElse(() => '.')),

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
    return new LanguageClient(extensionServerChannelName, serverOptions, clientConfig);
  }),
)
  .pipe(Layer.provide(ClientLanguageOptionsContext.Live))
  .pipe(Layer.provide(ServerLanguageOptionsContext.Live));
