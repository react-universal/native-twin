import * as vscode from 'vscode';
import { LanguageClientOptions } from 'vscode-languageclient';
import { DOCUMENT_SELECTORS, configurationSection } from '../src/utils/constants.utils';

export const createLanguageClient = () => {};

export const getDefaultLanguageCLientOptions = (data: {
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
