import * as Ctx from 'effect/Context';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { LanguageClient, LanguageClientOptions } from 'vscode-languageclient/node';
// import { DocumentSelector } from 'vscode-languageclient/node';
// import { configurationSection } from '../../internal/config';
// import { ClientConfigContext } from '../config/client.config';
// import { config } from '../config/config.actions';
import { ServerConfigContext } from '../config/server.config';
import { VSCodeContext } from '../vscode/vscode.context';

export class LanguageOptions extends Data.TaggedClass(
  'LanguageClientOptions',
)<LanguageClientOptions> {
  set(values: LanguageClientOptions) {
    return new LanguageOptions({ ...values });
  }
}

export class LanguageClientContext extends Ctx.Tag('LanguageClientContext')<
  LanguageClientContext,
  LanguageClient
>() {
  static readonly Live = Layer.scoped(
    LanguageClientContext,
    Effect.all([ServerConfigContext, VSCodeContext]).pipe(
      Effect.map(([serverConfig]) => {
        return LanguageClientContext.of(new LanguageClient('asd', serverConfig, {}));
      }),
    ),
  );
}

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
