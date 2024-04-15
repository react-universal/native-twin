import * as Ctx from 'effect/Context';
import * as Data from 'effect/Data';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from 'vscode-languageclient/node';

export class LanguageOptionsState extends Data.TaggedClass('LanguageClientOptions')<{
  client: SubscriptionRef.SubscriptionRef<LanguageClientOptions>;
  server: SubscriptionRef.SubscriptionRef<ServerOptions>;
}> {}

export class LanguageClientContext extends Ctx.Tag('vscode/LanguageClientContext')<
  LanguageClientContext,
  LanguageClient
>() {}

// const clientOptions: LanguageClientOptions = {
//   documentSelector: DOCUMENT_SELECTORS,
//   synchronize: {
//     // TODO let users customize this
//     // TODO ignore any files that are git-ignored like node_modules
//     fileEvents: vscode.workspace.createFileSystemWatcher('**/*.{ts,tsx}'),
//     configurationSection: configurationSection, // The configuration section the server wants to listen for
//   },

//   initializationOptions: {
//     ...vscode.workspace.getConfiguration(configurationSection), // Pass the config to the server
//     workspaceRoot,

//     capabilities: {
//       completion: {
//         dynamicRegistration: false,
//         completionItem: {
//           snippetSupport: true,
//         },
//       },
//     },
//   },
//   errorHandler: {
//     error: () => {
//       return {
//         action: ErrorAction.Continue,
//       };
//     },
//     closed: async () => {
//       return {
//         action: CloseAction.DoNotRestart,
//       };
//     },
//   },
// };
