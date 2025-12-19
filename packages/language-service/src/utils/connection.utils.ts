import * as Effect from 'effect/Effect';
import * as Runtime from 'effect/Runtime';
import * as vscode from 'vscode-languageserver';
import type * as lsp from 'vscode-languageserver-protocol';
import { LSPConstants } from '../models/lsp.constants';

export const initializeConnection = (
  params: vscode.InitializeParams,
  _token: vscode.CancellationToken,
  _workDoneProgress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<never> | undefined,
) => {
  const configOptions = params.initializationOptions;

  if (configOptions) {
    // const twinConfigFile = Option.fromNullable<vscode.URI>(
    //   configOptions?.twinConfigFile?.path,
    // );
    // Option.map(twinConfigFile, (x) => {
    //   manager.loadUserFile(x);
    // });
  }

  const capabilities = getClientCapabilities(params.capabilities);
  return capabilities;
};

export const getClientCapabilities = (capabilities: vscode.ClientCapabilities) => {
  const setup = {
    hasConfigurationCapability: !!(
      capabilities.workspace && !!capabilities.workspace.configuration
    ),
    hasWorkspaceFolderCapability: !!(
      capabilities.workspace && !!capabilities.workspace.workspaceFolders
    ),
    hasDiagnosticRelatedInformationCapability: !!(
      capabilities.textDocument &&
      capabilities.textDocument.publishDiagnostics &&
      capabilities.textDocument.publishDiagnostics.relatedInformation
    ),
  };
  const result: vscode.InitializeResult = {
    capabilities: {
      textDocumentSync: vscode.TextDocumentSyncKind.Incremental,
      colorProvider: true,
      hoverProvider: true,
      documentHighlightProvider: true,
      codeActionProvider: true,
      workspaceSymbolProvider: {
        resolveProvider: true,
      },
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
        completionItem: {
          labelDetailsSupport: true,
        },
        triggerCharacters: ['`', '"', "'"],
      },
      workspace: {
        workspaceFolders: {
          supported: setup.hasConfigurationCapability,
          changeNotifications: setup.hasConfigurationCapability,
        },
      },

      diagnosticProvider: {
        interFileDependencies: setup.hasDiagnosticRelatedInformationCapability,
        documentSelector: LSPConstants.documentSelectors,
        workspaceDiagnostics: false,
        // identifier: LSPConstants.diagnosticProviderSource,
      },
    },
  };
  return result;
};

export const addServerRequestHandler = <_Params, Result, Error, E, R>(
  event: (handler: lsp.GenericRequestHandler<Result, Error>) => vscode.Disposable,
  handler: (
    ...x: Parameters<lsp.GenericRequestHandler<Result, Error>>
  ) => Effect.Effect<ReturnType<lsp.GenericRequestHandler<Result, Error>>, E, R>,
) => {
  return Effect.flatMap(Effect.runtime<R>(), (runtime) =>
    Effect.async((_resume) => {
      const run = Runtime.runPromise(runtime);
      event(async (...args) => run(handler(...args)));
    }),
  ).pipe(Effect.fork);
};

export const addConnectionRequestHandler = <Params, Result, Error>(
  event: (handler: vscode.RequestHandler<Params, Result, Error>) => vscode.Disposable,
  handler: vscode.RequestHandler<Params, Result, Error>,
) => {
  return Effect.sync(() => {
    return event((...args) => handler(...args));
  });
};
