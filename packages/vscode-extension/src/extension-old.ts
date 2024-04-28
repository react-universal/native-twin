// Based on https://github.com/mjbvz/vscode-lit-html/blob/master/src/index.ts
import * as vscode from 'vscode';
import { pluginId } from './services/extension/extension.constants';
import { enableExtension } from './utils/enableExtension';
import { createLogger } from './utils/logger';

export async function activate(context: vscode.ExtensionContext) {
  const log = createLogger(
    vscode.window.createOutputChannel('Native Tailwind IntelliSense'),
  );

  await enableExtension(context, log)
    .catch((error) => {
      log(`Activating ${pluginId} failed: ${error.stack}`);
    })
    .then(() => {
      log(`Activating ${pluginId} success`);
    });

  // vscode.window.createOutputChannel('nativeTwin');
  // vscode.window.createOutputChannel('@native-twin/ts-plugin');
}