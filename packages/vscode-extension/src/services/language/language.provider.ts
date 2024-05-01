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
  ServerOptions,
} from 'vscode-languageclient/node';
// import { parseTemplate } from '@native-twin/language-server/plugin-parser';
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

    const serverConfig: ServerOptions = {
      run: {
        module: path.resolve(__dirname, '../../servers/native-twin.server'),
        transport: TransportKind.ipc,
      },
      debug: {
        module: path.resolve(__dirname, '../../servers/native-twin.server'),
        transport: TransportKind.ipc,
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
        fileEvents: fileEvents,
        configurationSection: configurationSection,
      },
      markdown: {
        isTrusted: true,
      },
      middleware: {
        // provideCompletionItem: async (document, position, context, token, next) => {
        //   const data = await next(document, position, context, token);
        //   return data;
        // },
        // resolveCompletionItem: async (item, token, next) => {
        //   const data = await next(item, token);
        //   if (data) {
        //     console.log('resolveCompletionItem: ', data);
        //   }
        //   return data;
        // },
        // provideHover: async (document, position, token, next) => {
        //   const data = await next(document, position, token);
        //   if (data?.range) {
        //     if (data.range.contains(position)) {
        //       data.
        //     }
        //   }
        //   return data;
        // },
        provideColorPresentations: async (_color, _context, _token, _next) => {
          // await next(color, context, token);
          return [];
        },
        provideDocumentColors: async (document, token, next) => {
          const data = await next(document, token);
          return data;
        },
      },

      initializationOptions: {
        ...vscode.workspace.getConfiguration(configurationSection),
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
