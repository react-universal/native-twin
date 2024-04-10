import * as Ctx from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocuments } from 'vscode-languageserver/node';

export class DocumentsContext extends Ctx.Tag('DocumentsContext')<
  DocumentsContext,
  TextDocuments<TextDocument>
>() {}

const documentsContextImplementation = Layer.effect(
  DocumentsContext,
  Effect.succeed(new TextDocuments(TextDocument)).pipe(
    Effect.tap(() => Effect.log('Documents Initialized')),
  ),
);

export const DocumentsContextLive = Effect.scoped(
  Layer.memoize(documentsContextImplementation).pipe(
    Effect.flatMap((memoized) =>
      Effect.gen(function* (_) {
        return yield* _(DocumentsContext, Effect.provide(memoized));
      }),
    ),
  ),
);
