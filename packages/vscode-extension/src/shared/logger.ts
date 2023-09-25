import * as vscode from 'vscode';

export class LoggerService {
  channelName: string;
  outputChannel: vscode.OutputChannel;
  constructor(channelName: string) {
    this.outputChannel = vscode.window.createOutputChannel(channelName);
    this.channelName = channelName;
  }

  log(msg: string) {
    this.outputChannel.append(`${new Date().toLocaleTimeString()}: ${msg}`);
  }
}
