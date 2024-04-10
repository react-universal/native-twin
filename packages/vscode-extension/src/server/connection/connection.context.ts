import { Effect } from 'effect';
import * as Ctx from 'effect/Context';
import { Connection, Disposable, ServerRequestHandler } from 'vscode-languageserver/node';

export class ConnectionContext extends Ctx.Tag('ConnectionContext')<
  ConnectionContext,
  Connection
>() {}

export const installConnectionRequestHandler = <Params, Result, Error>(
  event: (handler: ServerRequestHandler<Params, Result, never, Error>) => Disposable,
  handler: (x: Params) => Result,
) => {
  return Effect.succeed(event((x) => handler(x)));
};
