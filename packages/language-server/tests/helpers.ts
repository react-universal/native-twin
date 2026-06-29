import * as vscode from 'vscode';
import { LSPConstants } from '@native-twin/language-service';
import type { LanguageClientOptions } from 'vscode-languageclient';

export const createLanguageClient = () => {};

export const getDefaultLanguageCLientOptions = (data: {
  tsConfigFiles: vscode.Uri[];
  twinConfigFile: vscode.Uri | undefined;
  workspaceRoot: vscode.WorkspaceFolder | undefined;
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
