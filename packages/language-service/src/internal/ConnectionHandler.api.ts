import * as Array from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Equivalence from 'effect/Equivalence';
import * as Layer from 'effect/Layer';
import * as Logger from 'effect/Logger';
import * as LogLevel from 'effect/LogLevel';
import * as Queue from 'effect/Queue';
import * as Stream from 'effect/Stream';
import type { Connection } from 'vscode-languageserver';
import * as t from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { LSPConfig } from '../core/LSPContext.service';
import { FileNotFound, Range } from '../models/LSP.models';
import { LSPConstants, type TwinConfigOptions } from '../models/lsp.constants';

const makeDocuments = Effect.gen(function* () {
  const handler = yield* Effect.sync(() => new t.TextDocuments(TextDocument));

  const getDocument = (uri: t.URI) =>
    Effect.fromNullable(handler.get(uri)).pipe(
      Effect.mapError((data) => FileNotFound.create(data.message)),
    );

  const setup = (connection: Connection) =>
    Effect.acquireRelease(Effect.succeed(handler.listen(connection)), (release) =>
      Effect.sync(() => release.dispose()),
    );

  return { handler, getDocument, setup };
});
export interface LSPDocumentsCtx extends Effect.Effect.Success<typeof makeDocuments> {}
export const LSPDocumentsCtx = Context.GenericTag<LSPDocumentsCtx>('lsp/DocumentsHandler');
export const LSPDocumentsCtxLive = Layer.effect(LSPDocumentsCtx, makeDocuments);

const make = Effect.gen(function* () {
  const connection = yield* ConnectionCtx;
  const config = yield* LSPConfig;
  const documents = yield* LSPDocumentsCtx;

  const getDocumentSettings = (uri: t.URI): Effect.Effect<TwinConfigOptions> =>
    Effect.promise(() =>
      connection.workspace.getConfiguration({
        scopeUri: uri,
        section: LSPConstants.vscodeConfigSection,
      }),
    );

  const diagnosticsQueue = yield* Queue.unbounded<{ items: t.Diagnostic[]; uri: t.URI }>();

  const sendDiagnostics = (diagnostics: t.DocumentDiagnosticReport, uri: t.URI) =>
    Queue.offer(diagnosticsQueue, {
      items: diagnostics.kind === 'full' ? diagnostics.items : [],
      uri,
    });

  yield* Effect.addFinalizer(() =>
    Effect.sync(() => connection.dispose()).pipe(
      Effect.tap(() => Effect.log('Closing lsp server connection')),
    ),
  );

  // Start the connection (ordered by first document and then lsp server)
  yield* documents.setup(connection).pipe(Effect.andThen(() => connection.listen()));

  // Fork the diagnostics reported by the LSP and sent them to the client
  yield* Stream.fromQueue(diagnosticsQueue).pipe(
    Stream.whenEffect(config.configSelector((x) => x.diagnostics === 'off')),
    Stream.mapEffect((data) =>
      Effect.andThen(
        documents.getDocument(data.uri),
        (textDocument): t.PublishDiagnosticsParams => ({
          uri: textDocument.uri,
          diagnostics: Array.dedupeWith(
            data.items,
            Equivalence.mapInput(Range.equals, (item: t.Diagnostic) => Range.make(item.range)),
          ),
          version: textDocument.version,
        }),
      ),
    ),
    Stream.forever,
    Stream.runForEach((report) => Effect.promise(() => connection.sendDiagnostics(report))),
    Effect.forkScoped,
  );

  return { sendDiagnostics, getDocumentSettings, connection };
});

export const ConnectionCtx = Context.GenericTag<Connection>('lsp/connection-ref');
export interface ConnectionHandlerCtx extends Effect.Effect.Success<typeof make> {}
export const ConnectionHandlerCtx = Context.GenericTag<ConnectionHandlerCtx>(
  'lsp/ConnectionHandlerCtx',
);

export const makeConnectionHandlerCtx = (connection: Connection, verbose = false) =>
  Layer.provideMerge(
    Layer.scoped(ConnectionHandlerCtx, make).pipe(
      Layer.provide(Layer.succeed(ConnectionCtx, ConnectionCtx.of(connection))),
      Layer.provideMerge(LSPDocumentsCtxLive),
      Layer.provide(Logger.minimumLogLevel(verbose ? LogLevel.All : LogLevel.Info)),
    ),
  );
