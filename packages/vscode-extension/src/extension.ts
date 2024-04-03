// Based on https://github.com/mjbvz/vscode-lit-html/blob/master/src/index.ts
import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import { client as internalCLient } from './client';
import { createLogger } from './internal/logger';

let client: LanguageClient;

export async function activate(_context: vscode.ExtensionContext) {
  const log = createLogger(vscode.window.createOutputChannel('Native Tailwind IntelliSense'));

  log('sdfasd');
  client = internalCLient;
  client.start();
  // await enableExtension(context, log)
  //   .catch((error) => {
  //     log(`Activating ${pluginId} failed: ${error.stack}`);
  //   })
  //   .then(() => {
  //     log(`Activating ${pluginId} success`);
  //   });
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
