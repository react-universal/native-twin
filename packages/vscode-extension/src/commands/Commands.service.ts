import type * as vscode from 'vscode';
import { Effect } from 'effect';
import { registerCommand } from '../extension/extension.utils';

export const make = Effect.gen(function* () {
  registerCommand('compile.file', (uri: vscode.Uri) =>
    Effect.gen(function* () {
      console.log('URI: ', uri);
      return yield* Effect.succeed(1);
    }),
  );
});
