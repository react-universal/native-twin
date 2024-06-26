import * as vscode from 'vscode';
import { Logger } from '../../src/types';

export function createLogger(outputChannel: vscode.OutputChannel): Logger {
  return (message) => {
    const title = new Date().toLocaleTimeString();
    outputChannel.appendLine(`[${title}] ${message}`);
  };
}
