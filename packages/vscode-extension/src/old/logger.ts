import * as vscode from 'vscode';
import { LoggerFn } from '../types';

export function createLogger(outputChannel: vscode.OutputChannel): LoggerFn {
  return (message) => {
    const title = new Date().toLocaleTimeString();
    outputChannel.appendLine(`[${title}] ${message}`);
  };
}
