import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver/node';

export const getClientCapabilities = (capabilities: vscode.ClientCapabilities) => {
  return Effect.Do.pipe(
    Effect.bind('hasConfigurationCapability', () =>
      Effect.succeed(
        !!(capabilities.workspace && !!capabilities.workspace.configuration),
      ),
    ),
    Effect.bind('hasWorkspaceFolderCapability', () =>
      Effect.succeed(
        !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders),
      ),
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
      Effect.map((x): vscode.InitializeResult => {
        const result: vscode.InitializeResult = {
          capabilities: {
            textDocumentSync: vscode.TextDocumentSyncKind.Incremental,
            // TODO: Provide color implementation
            // colorProvider: {
            //   documentSelector: DOCUMENT_SELECTORS,
            //   id: 'nativeTwinColor',
            // },
            hoverProvider: true,
            // TODO: Provide Commands implementation
            // executeCommandProvider: {
            //   commands: ['getColors']
            // },
            workspaceSymbolProvider: {
              resolveProvider: true,
            },
            // Tell the client that this server supports code completion.
            completionProvider: {
              resolveProvider: true,
              completionItem: {
                labelDetailsSupport: true,
              },
              allCommitCharacters: ['`'],
              triggerCharacters: ['`'],
            },
            workspace: {
              workspaceFolders: {
                supported: x.hasConfigurationCapability,
              },
            },
            // TODO: Provide diagnostics implementation
            // diagnosticProvider: {
            //   interFileDependencies: false,
            //   workspaceDiagnostics: false,
            // },
          },
        };
        return result;
      }),
    )
    .pipe(Effect.tap(() => Effect.log(`Server Capabilities Filled`)));
};

export const addServerRequestHandler = <Params, Result, Error>(
  event: (
    handler: vscode.ServerRequestHandler<Params, Result, never, Error>,
  ) => vscode.Disposable,
  handler: vscode.ServerRequestHandler<Params, Result, never, Error>,
) => {
  return Effect.sync(() => {
    let result: Option.Option<vscode.HandlerResult<Result, Error>> = Option.none();
    return event((...args) => {
      result = Option.fromNullable(handler(...args));
      return result.pipe(Option.getOrThrow);
    });
  });
};

export const addConnectionRequestHandler = <Params, Result, Error>(
  event: (handler: vscode.RequestHandler<Params, Result, Error>) => vscode.Disposable,
  handler: vscode.RequestHandler<Params, Result, Error>,
) => {
  return Effect.sync(() => {
    return event((...args) => {
      return handler(...args);
    });
  });
};

export const onInitializeConnection = (params: vscode.InitializeParams) => {
  const configOptions = params.initializationOptions;

  const configFiles = {
    tsconfig: Option.fromNullable<vscode.URI>(configOptions?.tsconfigFiles?.[0]),
    twinConfigFile: Option.fromNullable<vscode.URI>(configOptions?.twinConfigFile),
    workspaceRoot: Option.fromNullable<vscode.WorkspaceFolder>(
      configOptions?.workspaceRoot,
    ),
  };

  const capabilities = getClientCapabilities(params.capabilities).pipe(Effect.runSync);

  return {
    capabilities,
    configFiles,
  };
};