import { NativeTwinManagerService } from '@native-twin/language-service';
import * as Cause from 'effect/Cause';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import { VscodeContext } from '../../extension/extension.service';
import { createFileWatchers, getColorDecoration, getConfigFiles } from '../common/language.utils';

export const LanguageClientLive = Effect.gen(function* () {
  const twin = yield* NativeTwinManagerService;
  const extensionCtx = yield* VscodeContext;

  yield* createFileWatchers;

  // const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

  // const serverConfig: ServerOptions = {
  //   run: {
  //     module: extensionCtx.asAbsolutePath(path.join('build', 'cjs', 'servers', 'lsp.node.js')),
  //     transport: TransportKind.ipc,
  //   },
  //   debug: {
  //     module: extensionCtx.asAbsolutePath(path.join('build', 'cjs', 'servers', 'lsp.node.js')),
  //     transport: TransportKind.ipc,
  //     options: debugOptions,
  //   },
  // };

  const configFiles = yield* getConfigFiles;
  const colorDecorationType = yield* getColorDecoration;
  extensionCtx.subscriptions.push(colorDecorationType);
  Option.fromNullable(configFiles.at(0)).pipe(Option.map((x) => twin.loadUserFile(x.path)));

  // const clientConfig: LanguageClientOptions = {
  //   ...getDefaultLanguageClientOptions({
  //     twinConfigFile: twin._configFile,
  //     workspaceRoot: twin.configFileRoot,
  //   }),
  //   synchronize: {
  //     fileEvents: fileEvents,
  //     configurationSection: Constants.configurationSection,
  //   },
  //   errorHandler: {
  //     error: onLanguageClientError,
  //     closed: onLanguageClientClosed,
  //   },
  //   diagnosticCollectionName: Constants.diagnosticProviderSource,
  //   outputChannel: vscode.window.createOutputChannel(Constants.extensionServerChannelName, {
  //     log: true,
  //   }),
  //   middleware: {
  //     workspace: {
  //       workspaceFolders: (token, next) => {
  //         return next(token);
  //       },
  //     },
  //     provideDocumentColors: async (document, token, next) => {
  //       return onProvideDocumentColors(document, token, next, colorDecorationType);
  //     },
  //   },
  // };
  // const languageClient = yield* Effect.acquireRelease(
  //   Effect.sync(
  //     () =>
  //       new LanguageClient(
  //         Constants.configurationSection,
  //         Constants.extensionServerChannelName,
  //         serverConfig,
  //         clientConfig,
  //       ),
  //   ),
  //   (x) =>
  //     Effect.promise(() => x.dispose()).pipe(
  //       Effect.flatMap(() => Effect.logDebug('Language Client Disposed')),
  //     ),
  // );

  // yield* Effect.promise(() => languageClient.start()).pipe(
  //   Effect.andThen(Effect.log('Language client started!')),
  // );

  // yield* registerCommand(`${Constants.configurationSection}.restart`, () =>
  //   Effect.gen(function* () {
  //     yield* Effect.promise(() => languageClient.restart());
  //     yield* Effect.log('Client restarted');
  //   }),
  // );

  
}).pipe(
  Effect.withLogSpan('LanguageServiceClient'),
  Effect.onError((error) => Effect.logError('ERROR: ', Cause.prettyErrors(error))),
  Layer.scopedDiscard,
);
