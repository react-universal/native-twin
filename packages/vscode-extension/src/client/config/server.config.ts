import * as Ctx from 'effect/Context';
import * as Layer from 'effect/Layer';
import path from 'path';
import { NodeModule, TransportKind } from 'vscode-languageclient/node';

export class ServerConfigContext extends Ctx.Tag('ServerConfigContext')<
  ServerConfigContext,
  {
    readonly run: NodeModule;
    readonly debug: NodeModule;
  }
>() {
  static readonly Live = Layer.succeed(
    ServerConfigContext,
    ServerConfigContext.of({
      run: {
        module: path.resolve(__dirname, './server'),
        transport: TransportKind.ipc,
      },
      debug: {
        module: path.resolve(__dirname, './server'),
      },
    }),
  );
}
