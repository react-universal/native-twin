import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { Connection, createConnection } from 'vscode-languageserver/node';

export class ConnectionService extends Context.Tag('connection/service')<
  ConnectionService,
  Connection
>() {
  static Live = Layer.scoped(
    ConnectionService,
    Effect.gen(function* () {
      const connection = createConnection();
      // const clientConfig = yield* $(ClientConfig.make);

      return connection;
    }),
  );
}
