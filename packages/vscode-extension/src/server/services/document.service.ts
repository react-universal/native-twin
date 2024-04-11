import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import { ConnectionContext } from '../connection/connection.context';
import { DocumentResource, DocumentsContext } from '../documents/documents.context';

export const DocumentResourceHandler = Layer.effect(
  DocumentResource,
  Effect.gen(function* ($) {
    const docsHandler = yield* $(DocumentsContext);
    const connection = yield* $(ConnectionContext);
    return {
      acquireDocument: (uri: string) =>
        Effect.sync(() => {
          const document = Option.fromNullable(docsHandler.get(uri));
          return document;
        }),
      getDocumentSettings: (uri, section) =>
        Effect.gen(function* ($) {
          const result = yield* $(
            Effect.promise(() =>
              connection.workspace.getConfiguration({
                scopeUri: uri,
                section: section,
              }),
            ),
          );
          return result;
        }),
    };
  }),
);
