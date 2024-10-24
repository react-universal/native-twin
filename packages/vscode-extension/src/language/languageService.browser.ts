import * as Ctx from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Stream from 'effect/Stream';
import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions } from 'vscode-languageclient/browser';
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

// import TwinWorker from './twin.worker.js';

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

      // const serverConfig: ServerOptions = {
      //   run: {
      //     module: path.resolve(__dirname, './native-twin.server'),
      //     transport: TransportKind.ipc,
      //   },
      //   debug: {
      //     module: path.resolve(__dirname, './native-twin.server'),
      //     transport: TransportKind.ipc,
      //   },
      // };

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
            new LanguageClient(
              'native-twin-vscode',
              extensionServerChannelName,
              clientConfig,
              new Worker(
                vscode.Uri.joinPath(extensionCtx.extensionUri, 'twin.worker.js').toString(
                  true,
                ),
              ),
            ),
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
          yield* Effect.promise(() => client.stop());
          yield* Effect.promise(() => client.start());
          yield* Effect.logInfo('Client restarted');
        }),
      );

      const tagsConfig = yield* extensionConfigValue(
        'nativeTwin',
        'tags',
        DEFAULT_PLUGIN_CONFIG.tags,
      );
      const debugConfig = yield* extensionConfigValue(
        'nativeTwin',
        'debug',
        DEFAULT_PLUGIN_CONFIG.debug,
      );

      yield* tagsConfig.changes.pipe(
        Stream.runForEach((x) => Effect.log('TAGS: ', x)),
        Effect.fork,
      );
      yield* debugConfig.changes.pipe(
        Stream.runForEach((x) => Effect.log('DEBUG: ', x)),
        Effect.fork,
      );

      return client;
    }),
  );
}
