import * as E from 'effect/Effect';
import { ClientCapabilities } from 'vscode-languageserver/node';

export const setConfigCapabilities = (capabilities: ClientCapabilities) => {
  return E.Do.pipe(
    E.bind('hasConfigurationCapability', () =>
      E.succeed(!!(capabilities.workspace && !!capabilities.workspace.configuration)),
    ),
    E.bind('hasWorkspaceFolderCapability', () =>
      E.succeed(!!(capabilities.workspace && !!capabilities.workspace.workspaceFolders)),
    ),
    E.bind('hasDiagnosticRelatedInformationCapability', () =>
      E.succeed(
        !!(
          capabilities.textDocument &&
          capabilities.textDocument.publishDiagnostics &&
          capabilities.textDocument.publishDiagnostics.relatedInformation
        ),
      ),
    ),
    E.runSync,
  );
};
