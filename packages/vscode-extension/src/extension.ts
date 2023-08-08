// Based on https://github.com/mjbvz/vscode-lit-html/blob/master/src/index.ts
import * as vscode from 'vscode';
import { version as extensionVersion } from '../package.json';
import { enableExtension } from './internal/enableExtension';
import { extensionName, pluginId } from './internal/config';
import { createLogger } from './internal/logger';

export async function activate(context: vscode.ExtensionContext) {
  const log = createLogger(vscode.window.createOutputChannel('Native Tailwind IntelliSense'));
  log(`Extension Name: ${extensionName}.`);
  log(`Extension Version: ${extensionVersion}.`);

  await enableExtension(context, log).catch((error) => {
    log(`Activating ${pluginId} failed: ${error.stack}`);
  });
}
