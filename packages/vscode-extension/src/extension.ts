// Based on https://github.com/mjbvz/vscode-lit-html/blob/master/src/index.ts
import * as vscode from 'vscode';
import { pluginId } from './internal/config';
import { enableExtension } from './internal/enableExtension';
import { createLogger } from './internal/logger';

export async function activate(context: vscode.ExtensionContext) {
  const log = createLogger(vscode.window.createOutputChannel('Native Tailwind IntelliSense'));

  await enableExtension(context, log)
    .catch((error) => {
      log(`Activating ${pluginId} failed: ${error.stack}`);
    })
    .then(() => {
      log(`Activating ${pluginId} success`);
    });
}
