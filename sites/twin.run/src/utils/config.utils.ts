import { LogLevel } from '@codingame/monaco-vscode-api';
import type { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import type { MonacoVscodeApiConfig } from 'monaco-languageclient/vscodeApiWrapper';
import { configureDefaultWorkerFactory } from 'monaco-languageclient/workerFactory';

export const createVscodeApiConfig = (workspaceFileUri: URI): MonacoVscodeApiConfig => {
  return {
    $type: 'extended',
    viewsConfig: {
      $type: 'EditorService',
      htmlContainer: document.getElementById('monaco-editor-root')!,
    },
    advanced: {
      enableExtHostWorker: true,
    },
    logLevel: LogLevel.Debug,
    workspaceConfig: {
      enableWorkspaceTrust: true,
      workspaceProvider: {
        trusted: true,
        async open() {
          window.open(window.location.href);
          return true;
        },
        workspace: {
          workspaceUri: workspaceFileUri,
        },
      },
    },
    userConfiguration: {
      json: JSON.stringify({
        'workbench.colorTheme': 'Default Dark Modern',
        'editor.wordBasedSuggestions': 'off',
        'typescript.tsserver.web.projectWideIntellisense.enabled': true,
        'typescript.tsserver.web.projectWideIntellisense.suppressSemanticErrors': false,
        'diffEditor.renderSideBySide': false,
        'editor.guides.bracketPairsHorizontal': true,
        'editor.experimental.asyncTokenization': true,
      }),
    },
    monacoWorkerFactory: configureDefaultWorkerFactory,
  };
};
