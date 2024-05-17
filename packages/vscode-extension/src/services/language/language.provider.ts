import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import path from 'path';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  TransportKind,
  ServerOptions,
} from 'vscode-languageclient/node';
import {
  configurationSection,
  extensionServerChannelName,
} from '../extension/extension.constants';
import { ExtensionContext } from '../extension/extension.context';
import { registerCommand, thenable } from '../extension/extension.utils';
import { LanguageClientContext } from './language.context';
import {
  getDefaultLanguageCLientOptions,
  onLanguageClientClosed,
  onLanguageClientError,
  onProvideDocumentColors,
} from './language.fn';

export const LanguageClientLive = Layer.scoped(
  LanguageClientContext,
  Effect.gen(function* ($) {
    const extensionCtx = yield* ExtensionContext;
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

    if (configFiles.length === 0) {
      yield* Effect.logWarning('Cant find a native-twin configuration file');
    }

    const colorDecorationType = vscode.window.createTextEditorDecorationType({
      before: {
        width: '0.8em',
        height: '0.8em',
        contentText: ' ',
        border: '0.1em solid',
        margin: '0.1em 0.2em 0',
      },
      dark: {
        before: {
          borderColor: '#eeeeee',
        },
      },
      light: {
        before: {
          borderColor: '#000000',
        },
      },
    });

    extensionCtx.subscriptions.push(colorDecorationType);

    const clientConfig: LanguageClientOptions = {
      ...getDefaultLanguageCLientOptions({
        tsConfigFiles: tsconfigFiles ?? [],
        twinConfigFile: configFiles.at(0),
        workspaceRoot: workspace?.at(0),
      }),
      synchronize: {
        fileEvents: fileEvents,
        configurationSection: configurationSection,
      },
      errorHandler: {
        error: onLanguageClientError,
        closed: onLanguageClientClosed,
      },
      middleware: {
        provideDocumentColors: async (document, token, next) =>
          onProvideDocumentColors(document, token, next, colorDecorationType),
      },
    };
    const client = yield* Effect.acquireRelease(
      Effect.sync(
        () => new LanguageClient(extensionServerChannelName, serverConfig, clientConfig),
      ),
      (x) => Effect.promise(() => x.dispose()),
    );

    yield* $(Effect.promise(() => client.start()));
    yield* $(Effect.log('Language client started!'));

    yield* registerCommand(`${configurationSection}.restart`, () =>
      Effect.gen(function* () {
        yield* Effect.promise(() => client.restart());
        yield* Effect.logInfo('Client restarted');
      }),
    );

    return client;
  }),
);
