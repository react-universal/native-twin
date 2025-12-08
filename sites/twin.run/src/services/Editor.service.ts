import * as vscode from 'vscode';
import * as Context from 'effect/Context';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Ref from 'effect/Ref';
import { MonacoContext } from './Monaco.service';

const make = Effect.gen(function* () {
  const ctx = yield* MonacoContext;
  const resources = yield* Ref.make(vscode.window.activeTextEditor!);

  const handleError = (error: Error) => Effect.fail(EditorError.create(error.message, error));

  return {
    handleError,
  };
});

export interface EditorHandler extends Effect.Effect.Success<typeof make> {}
export const EditorHandler = Context.GenericTag<EditorHandler>('lsp/fs-storage');
export const EditorHandlerLive = Layer.effect(EditorHandler, make).pipe(traceLayerLogs('Store'));

export class EditorError extends Data.TaggedError('editor/error')<{
  reason: string;
  error?: Error;
}> {
  static create(reason: string, error?: Error) {
    return new EditorError({ reason, error });
  }
}
