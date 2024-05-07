import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as vscode from 'vscode-languageserver/node';

export class ConnectionService extends Context.Tag('connection/service')<
  ConnectionService,
  vscode.Connection
>() {
  static Live = Layer.scoped(
    ConnectionService,
    Effect.sync(() => vscode.createConnection()),
  );
}
