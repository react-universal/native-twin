import * as Ctx from 'effect/Context';
import { Connection } from 'vscode-languageserver/node';

export class ConnectionContext extends Ctx.Tag('ConnectionContext')<
  ConnectionContext,
  Connection
>() {}

