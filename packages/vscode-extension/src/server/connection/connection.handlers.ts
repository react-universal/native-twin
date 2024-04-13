import * as Effect from 'effect/Effect';
import {
  ClientCapabilities,
  InitializeResult,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node';

export const getClientCapabilities = (capabilities: ClientCapabilities) => {
  return Effect.Do.pipe(
    Effect.bind('hasConfigurationCapability', () =>
      Effect.succeed(!!(capabilities.workspace && !!capabilities.workspace.configuration)),
    ),
    Effect.bind('hasWorkspaceFolderCapability', () =>
      Effect.succeed(!!(capabilities.workspace && !!capabilities.workspace.workspaceFolders)),
    ),
    Effect.bind('hasDiagnosticRelatedInformationCapability', () =>
      Effect.succeed(
        !!(
          capabilities.textDocument &&
          capabilities.textDocument.publishDiagnostics &&
          capabilities.textDocument.publishDiagnostics.relatedInformation
        ),
      ),
    ),
  )
    .pipe(
      Effect.map((x): InitializeResult => {
        const result: InitializeResult = {
          capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            // Tell the client that this server supports code completion.
            completionProvider: {
              resolveProvider: true,
            },
            workspace: {
              workspaceFolders: {
                supported: x.hasConfigurationCapability,
              },
            },
            diagnosticProvider: {
              interFileDependencies: false,
              workspaceDiagnostics: false,
            },
          },
        };
        return result;
      }),
    )
    .pipe(Effect.tap(() => Effect.log(`Connection Initialize`)));
};
