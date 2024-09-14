import * as Context from 'effect/Context';
import * as Layer from 'effect/Layer';
import type * as vscode from 'vscode-languageserver';

export class ConnectionService extends Context.Tag('connection/service')<
  ConnectionService,
  vscode.Connection
>() {
  static make = (connection: vscode.Connection) =>
    Layer.succeed(
      ConnectionService,
      connection,
    );
}
