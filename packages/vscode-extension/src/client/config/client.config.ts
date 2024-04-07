import * as Ctx from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as O from 'effect/Option';
import * as vscode from 'vscode';

export class ClientConfigContext extends Ctx.Tag('ClientConfigContext')<
  ClientConfigContext,
  {
    readonly workspaceFolders: Effect.Effect<readonly vscode.WorkspaceFolder[]>;
    readonly workspaceRoot: O.Option<string>;
  }
>() {
  static readonly Live = Layer.effect(
    ClientConfigContext,
    Effect.succeed(vscode.workspace.workspaceFolders).pipe(
      Effect.map((x) => x ?? []),
      Effect.map((x) => {
        return ClientConfigContext.of({
          workspaceFolders: Effect.succeed(x),
          workspaceRoot: O.fromNullable(x[0]?.uri.fsPath ?? null),
        });
      }),
    ),
  );
}
