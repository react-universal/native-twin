import * as vscode from 'vscode';
import type { LanguageClientOptions } from 'vscode-languageclient';
import { LSPConstants } from '../src/models/lsp.constants';

export const getDefaultLanguageClientOptions = (data: {
  tsConfigFiles: vscode.Uri[];
  twinConfigFile: vscode.Uri | undefined;
  rootDir: vscode.WorkspaceFolder | undefined;
}): LanguageClientOptions => {
  return {
    documentSelector: LSPConstants.documentSelectors,

    markdown: {
      isTrusted: true,
      supportHtml: true,
    },
    initializationOptions: {
      ...vscode.workspace.getConfiguration(LSPConstants.vscodeConfigSection),
      ...data,
      capabilities: {
        completion: {
          dynamicRegistration: false,
          completionItem: {
            snippetSupport: true,
          },
        },
      },
    },
    progressOnInitialization: true,
  };
};
