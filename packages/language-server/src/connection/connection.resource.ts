import * as Effect from 'effect/Effect';
import * as Ref from 'effect/Ref';
import { Connection, createConnection } from 'vscode-languageserver/node';

export class ConnectionResource {
  get: Effect.Effect<Connection>;
  set: Effect.Effect<void>;

  constructor(private connection: Ref.Ref<Connection>) {
    this.get = Ref.get(this.connection);
    this.set = Ref.update(this.connection, (x) => x);
  }
}

export const make = Effect.map(
  Ref.make(createConnection()),
  (value) => new ConnectionResource(value),
);
