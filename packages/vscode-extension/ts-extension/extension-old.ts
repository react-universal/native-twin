// Based on https://github.com/mjbvz/vscode-lit-html/blob/master/src/index.ts
import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import { client as internalClient } from '../src/client';
import { createLogger } from './internal/logger';
import { enableExtension } from './internal/enableExtension';
import { pluginId } from './internal/config';

let client: LanguageClient;

export async function activate(context: vscode.ExtensionContext) {
  const log = createLogger(vscode.window.createOutputChannel('Native Tailwind IntelliSense'));

  client = internalClient;
  client.start();
  await enableExtension(context, log)
    .catch((error) => {
      log(`Activating ${pluginId} failed: ${error.stack}`);
    })
    .then(() => {
      log(`Activating ${pluginId} success`);
    });
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
