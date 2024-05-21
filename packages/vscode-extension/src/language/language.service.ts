import * as Ctx from 'effect/Context';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import path from 'path';
import * as vscode from 'vscode';
import {
  TransportKind,
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from 'vscode-languageclient/node';
import {
  configurationSection,
  extensionServerChannelName,
} from '../extension/extension.constants';
import { ExtensionContext } from '../extension/extension.service';
import { registerCommand, thenable } from '../extension/extension.utils';
import { createFileWatchers, getColorDecoration, getConfigFiles } from './language.utils';
import {
  getDefaultLanguageCLientOptions,
  onLanguageClientClosed,
  onLanguageClientError,
  onProvideDocumentColors,
} from './language.fn';

export class LanguageOptionsState extends Data.TaggedClass('LanguageClientOptions')<{
  client: SubscriptionRef.SubscriptionRef<LanguageClientOptions>;
  server: SubscriptionRef.SubscriptionRef<ServerOptions>;
}> {}

export class LanguageClientContext extends Ctx.Tag('vscode/LanguageClientContext')<
  LanguageClientContext,
  LanguageClient
>() {
  static Live = Layer.scoped(
    LanguageClientContext,
    Effect.gen(function* ($) {
      const extensionCtx = yield* ExtensionContext;
      const workspace = vscode.workspace.workspaceFolders;

      const tsconfigFiles = yield* $(
        thenable(() => vscode.workspace.findFiles('**tsconfig.json', '', 1)),
      );

      const fileEvents = yield* createFileWatchers;

      const serverConfig: ServerOptions = {
        run: {
          module: path.resolve(__dirname, '../servers/native-twin.server'),
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
          () =>
            new LanguageClient(extensionServerChannelName, serverConfig, clientConfig),
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
}
