import * as Ctx from 'effect/Context';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import path from 'path';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  NodeModule,
  TransportKind,
} from 'vscode-languageclient/node';

export class LanguageOptions extends Data.TaggedClass(
  'LanguageClientOptions',
)<LanguageClientOptions> {
  set(values: LanguageClientOptions) {
    return new LanguageOptions({ ...values });
  }
}

export class LanguageClientContext extends Ctx.Tag('vscode/LanguageClientContext')<
  LanguageClientContext,
  LanguageClient
>() {}

export class ClientLanguageOptionsContext extends Ctx.Tag('language/ClientConfigContext')<
  ClientLanguageOptionsContext,
  {
    readonly workspaceFolders: Effect.Effect<readonly vscode.WorkspaceFolder[]>;
    readonly workspaceRoot: Option.Option<string>;
  }
>() {
  static readonly Live = Layer.effect(
    ClientLanguageOptionsContext,
    Effect.succeed(vscode.workspace.workspaceFolders).pipe(
      Effect.map((x) => x ?? []),
      Effect.map((x) => {
        return ClientLanguageOptionsContext.of({
          workspaceFolders: Effect.succeed(x),
          workspaceRoot: Option.fromNullable(x[0]?.uri.fsPath ?? null),
        });
      }),
    ),
  );
}

export class ServerLanguageOptionsContext extends Ctx.Tag(
  'language/ServerLanguageOptionsContext',
)<
  ServerLanguageOptionsContext,
  {
    readonly run: NodeModule;
    readonly debug: NodeModule;
  }
>() {
  static readonly Live = Layer.succeed(
    ServerLanguageOptionsContext,
    ServerLanguageOptionsContext.of({
      run: {
        module: path.resolve(__dirname, './server'),
        transport: TransportKind.ipc,
      },
      debug: {
        module: path.resolve(__dirname, './server'),
      },
    }),
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
