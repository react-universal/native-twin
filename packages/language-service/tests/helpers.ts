import * as vscode from 'vscode';
import type { LanguageClientOptions } from 'vscode-languageclient';
import { configurationSection, DOCUMENT_SELECTORS } from '../src/utils/constants.utils';

export const getDefaultLanguageClientOptions = (data: {
  tsConfigFiles: vscode.Uri[];
  twinConfigFile: vscode.Uri | undefined;
  workspaceRoot: vscode.WorkspaceFolder | undefined;
}): LanguageClientOptions => {
  return {
    documentSelector: DOCUMENT_SELECTORS,

    markdown: {
      isTrusted: true,
      supportHtml: true,
    },
    initializationOptions: {
      ...vscode.workspace.getConfiguration(configurationSection),
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
