import { pipe } from 'effect/Function';
import * as Stream from 'effect/Stream';
import * as Ctx from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import path from 'path';
import * as vscode from 'vscode';
import {
  TransportKind,
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from 'vscode-languageclient/node';
import { DEFAULT_PLUGIN_CONFIG } from '@native-twin/language-service';
import {
  configurationSection,
  extensionServerChannelName,
} from '../extension/extension.constants';
import { ExtensionContext } from '../extension/extension.service';
import {
  extensionConfigValue,
  registerCommand,
  thenable,
} from '../extension/extension.utils';
import {
  getDefaultLanguageClientOptions,
  onLanguageClientClosed,
  onLanguageClientError,
  onProvideDocumentColors,
} from './language.fn';
import { createFileWatchers, getColorDecoration, getConfigFiles } from './language.utils';

export class LanguageClientContext extends Ctx.Tag('vscode/LanguageClientContext')<
  LanguageClientContext,
  LanguageClient
>() {
  static Live = Layer.scoped(
    LanguageClientContext,
    Effect.gen(function* () {
      const extensionCtx = yield* ExtensionContext;
      const workspace = vscode.workspace.workspaceFolders;

      const tsconfigFiles = yield* thenable(() =>
        vscode.workspace.findFiles('**tsconfig.json', '', 1),
      );

      const fileEvents = yield* createFileWatchers;

      const serverConfig: ServerOptions = {
        run: {
          module: path.resolve(__dirname, './native-twin.server'),
          transport: TransportKind.ipc,
        },
        debug: {
          module: path.resolve(__dirname, '../servers/native-twin.server'),
          transport: TransportKind.ipc,
        },
      };

      const configFiles = yield* getConfigFiles;
      const colorDecorationType = yield* getColorDecoration;
      extensionCtx.subscriptions.push(colorDecorationType);

      const clientConfig: LanguageClientOptions = {
        ...getDefaultLanguageClientOptions({
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
          () =>
            new LanguageClient(extensionServerChannelName, serverConfig, clientConfig),
        ),
        (x) =>
          Effect.promise(() => x.dispose()).pipe(
            Effect.flatMap(() => Effect.logDebug('Language Client Disposed')),
          ),
      );

      yield* Effect.promise(() => client.start()).pipe(
        Effect.andThen(Effect.log('Language client started!')),
      );

      client.onRequest('nativeTwinInitialized', () => {
        return { t: true };
      });

      yield* registerCommand(`${configurationSection}.restart`, () =>
        Effect.gen(function* () {
          yield* Effect.promise(() => client.restart());
          yield* Effect.logInfo('Client restarted');
        }),
      );

      const tagsConfig = yield* pipe(
        extensionConfigValue('nativeTwin', 'tags', DEFAULT_PLUGIN_CONFIG.tags),
        Effect.map((x) => x.changes),
      );
      const debugConfig = yield* pipe(
        extensionConfigValue('nativeTwin', 'debug', DEFAULT_PLUGIN_CONFIG.debug),
        Effect.map((x) => x.changes),
      );

      yield* pipe(
        Stream.merge(tagsConfig, debugConfig),
        Stream.runForEach((x) => Effect.log(x)),
      );

      return client;
    }),
  );
}
