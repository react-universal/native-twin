import * as path from 'path';
import * as vscode from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';
import { SUPPORTED_LANGUAGES } from './_config';
import { NativeStyledCompletionItemProvider } from './tw-completion.provider';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
  const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: SUPPORTED_LANGUAGES,

    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc'),
    },
  };

  client = new LanguageClient(
    'styledLanguageTW',
    'Tailwind Native IntelliSense',
    serverOptions,
    clientOptions,
  );

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      SUPPORTED_LANGUAGES,
      new NativeStyledCompletionItemProvider(),
      '`',
    ),
  );

  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
