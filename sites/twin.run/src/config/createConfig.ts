// sort-imports-ignore
/** biome-ignore-all lint/suspicious/noTemplateCurlyInString: necessary */
import * as vscode from 'vscode';
import { LogLevel } from '@codingame/monaco-vscode-api';
import getConfigurationServiceOverride from '@codingame/monaco-vscode-configuration-service-override';
import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override';
import getExplorerServiceOverride from '@codingame/monaco-vscode-explorer-service-override';
import {
  RegisteredFileSystemProvider,
  RegisteredMemoryFile,
  registerFileSystemOverlay,
} from '@codingame/monaco-vscode-files-service-override';
import getLanguageServiceOverride from '@codingame/monaco-vscode-languages-service-override';
import getLayoutServiceOverride from '@codingame/monaco-vscode-layout-service-override';
import getLifecycleServiceOverride from '@codingame/monaco-vscode-lifecycle-service-override';
import getModelServiceOverride from '@codingame/monaco-vscode-model-service-override';
import getOutlineServiceOverride from '@codingame/monaco-vscode-outline-service-override';
import getStorageServiceOverride from '@codingame/monaco-vscode-storage-service-override';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import getViewBannerServiceOverride from '@codingame/monaco-vscode-view-banner-service-override';
import getViewCommonOverride from '@codingame/monaco-vscode-view-common-service-override';
import getActBarServiceOverride from '@codingame/monaco-vscode-view-status-bar-service-override';
import getViewServiceOverride from '@codingame/monaco-vscode-views-service-override';
import getWorkbenchServiceOverride from '@codingame/monaco-vscode-workbench-service-override';
import getWorkspaceServiceOverride from '@codingame/monaco-vscode-workspace-trust-service-override';

// this is required syntax highlighting
import '@codingame/monaco-vscode-javascript-default-extension';
import '@codingame/monaco-vscode-json-default-extension';
import '@codingame/monaco-vscode-json-language-features-default-extension';
import '@codingame/monaco-vscode-html-default-extension';
import '@codingame/monaco-vscode-html-language-features-default-extension';
import '@codingame/monaco-vscode-standalone-html-language-features';

import '@codingame/monaco-vscode-css-default-extension';
import '@codingame/monaco-vscode-css-language-features-default-extension';
import '@codingame/monaco-vscode-standalone-css-language-features';
import '@codingame/monaco-vscode-markdown-basics-default-extension';
import '@codingame/monaco-vscode-markdown-language-features-default-extension';
import '@codingame/monaco-vscode-typescript-basics-default-extension';
import '@codingame/monaco-vscode-typescript-language-features-default-extension';
import '@codingame/monaco-vscode-standalone-typescript-language-features';
import editorWorker from '@codingame/monaco-vscode-editor-api/esm/vs/editor/editor.worker?worker&url';
import tsWorker from '@codingame/monaco-vscode-standalone-typescript-language-features/worker?worker?url';
import textMateWorker from '@codingame/monaco-vscode-textmate-service-override/worker?worker&url';
import { LSPConstants, parseLSPConfigInput } from '@native-twin/language-service/browser';
import type { Logger } from 'monaco-languageclient/common';
import type { EditorAppConfig } from 'monaco-languageclient/editorApp';
import type { LanguageClientConfig } from 'monaco-languageclient/lcwrapper';
import {
  defaultHtmlAugmentationInstructions,
  defaultViewsInit,
  type MonacoVscodeApiConfig,
  useOpenEditorStub,
} from 'monaco-languageclient/vscodeApiWrapper';
import { useWorkerFactory } from 'monaco-languageclient/workerFactory';
import reactFileText from '../fixtures/react/Basic.react?raw';
import twinConfigRaw from '../fixtures/tailwind-configs/tailwind-preset.config?raw';
import npmPkgRaw from '../fixtures/typescript/package.editor.json?raw';
import tsconfigRaw from '../fixtures/typescript/tsconfig.editor.json?raw';
import twinWorkerUrl from '../workers/twin.worker?worker&url';

export const configureProject = async () => {
  const workspaceUri = vscode.Uri.file('/workspace');
  const workspaceFileUri = vscode.Uri.file('/workspace.code-workspace');

  const vscodeApiConfig: MonacoVscodeApiConfig = {
    $type: 'extended',
    logLevel: LogLevel.Debug,
    serviceOverrides: {
      serviceOverrides: {
        ...getThemeServiceOverride(),
        ...getConfigurationServiceOverride(),
        ...getEditorServiceOverride(useOpenEditorStub),
        ...getLanguageServiceOverride(),
        ...getModelServiceOverride(),
        ...getStorageServiceOverride(),
        ...getWorkspaceServiceOverride(),
        ...getActBarServiceOverride(),
        ...getViewServiceOverride(),
        ...getLayoutServiceOverride(),
        ...getLifecycleServiceOverride(),
        ...getViewBannerServiceOverride(),
        ...getOutlineServiceOverride(),
        ...getWorkbenchServiceOverride(),
        ...getViewCommonOverride(),
        ...getExplorerServiceOverride(),
      },
    },
    viewsConfig: {
      $type: 'ViewsService',
      htmlContainer: document.body,
      // viewsInitFunc: defaultViewsInit,
      htmlAugmentationInstructions: defaultHtmlAugmentationInstructions,
    },
    workspaceConfig: {
      webviewEndpoint: 'twin-wv',
      enableWorkspaceTrust: true,
      developmentOptions: { logLevel: LogLevel.Debug },
      workspaceProvider: {
        trusted: true,
        async open() {
          window.open(window.location.href);
          return true;
        },
        workspace: {
          workspaceUri: workspaceFileUri,
          label: 'workspace',
          folderUri: workspaceUri,
        },
      },
      configurationDefaults: {
        'window.title': 'twin-editor-playground${separator}${dirty}${activeEditorShort}',
      },
      productConfiguration: {
        nameShort: LSPConstants.vscodeExtensionName,
        nameLong: LSPConstants.vscodeExtensionName,
      },
    },
    userConfiguration: {
      json: JSON.stringify({
        'workbench.colorTheme': 'Default Dark+',
        'editor.wordBasedSuggestions': 'off',
        'typescript.tsserver.web.projectWideIntellisense.enabled': true,
        'typescript.tsserver.web.projectWideIntellisense.suppressSemanticErrors': false,
        'editor.guides.bracketPairsHorizontal': true,
        'editor.experimental.asyncTokenization': true,
      }),
    },
    extensions: [
      {
        config: {
          // extensionKind: ['web', 'ui', 'workspace'],
          preview: true,
          activationEvents: ['onWebviewPanel:twinPreview'],
          contributes: {
            commands: [
              {
                command: 'nativeTwin.preview',
                title: 'Start twin preview',
                category: 'Twin Preview',
              },
            ],
          },
          name: LSPConstants.vscodeExtensionName,
          publisher: LSPConstants.vscodePublisher,
          version: '1.0.0',
          engines: {
            vscode: '*',
          },
        },
      },
    ],
    advanced: {
      enableExtHostWorker: true,
      loadThemes: true,
    },
    monacoWorkerFactory: configureMonacoWorkers,
  };

  const fileSystemProvider = new RegisteredFileSystemProvider(false);
  const reactUri = vscode.Uri.file('/workspace/Component.tsx');
  const npmPackageUri = vscode.Uri.file('/workspace/package.json');
  const tsConfigUri = vscode.Uri.file('/workspace/tsconfig.json');
  const twinConfigUri = vscode.Uri.file('/workspace/tailwind.config.ts');

  const textEncoder = new TextEncoder();

  fileSystemProvider.registerFile(
    new RegisteredMemoryFile(workspaceFileUri, createDefaultWorkspaceContent('/workspace')),
  );
  fileSystemProvider.registerFile(
    new RegisteredMemoryFile(reactUri, textEncoder.encode(reactFileText)),
  );
  fileSystemProvider.registerFile(
    new RegisteredMemoryFile(twinConfigUri, textEncoder.encode(twinConfigRaw)),
  );
  fileSystemProvider.registerFile(
    new RegisteredMemoryFile(npmPackageUri, textEncoder.encode(npmPkgRaw)),
  );
  fileSystemProvider.registerFile(
    new RegisteredMemoryFile(tsConfigUri, textEncoder.encode(tsconfigRaw)),
  );

  registerFileSystemOverlay(1, fileSystemProvider);

  const editorAppConfig: EditorAppConfig = {
    id: 'native.twin',
    logLevel: LogLevel.Debug,
    overrideAutomaticLayout: true,
    codeResources: {
      original: {
        text: reactFileText,
        enforceLanguageId: 'typescriptreact',
        uri: reactUri.fsPath,
      },
      modified: {
        text: reactFileText,
        enforceLanguageId: 'typescriptreact',
        uri: reactUri.fsPath,
      },
    },
    editorOptions: {
      theme: 'vs-dark',
      'semanticHighlighting.enabled': true,
    },
  };

  const languageClientConfig: LanguageClientConfig = {
    languageId: 'native.twin',
    disposeWorker: false,
    logLevel: LogLevel.Debug,
    restartOptions: { keepWorker: true, retries: 2, timeout: 5000 },
    connection: {
      options: {
        $type: 'WorkerDirect',
        worker: new Worker(twinWorkerUrl, {
          type: 'module',
          name: 'twin.worker',
        }),
      },
    },
    clientOptions: {
      initializationOptions: {
        // ...data,
        // ...vscode.workspace.getConfiguration(LSPConstants.vscodeConfigSection),
        workspaceRoot: '/workspace',
        ...parseLSPConfigInput({
          rootDir: workspaceUri.fsPath,
          debug: true,
          enable: true,
          twinConfigPath: twinConfigUri.fsPath,
          tsConfigPath: tsConfigUri.fsPath,
          completions: true,
          diagnostics: 'warn',
          trace: { server: 'verbose' },
        }),
        capabilities: {
          completion: {
            dynamicRegistration: false,
            resolveProvider: true,
            completionItem: {
              snippetSupport: true,
            },
          },
        },
      },
      progressOnInitialization: true,
      documentSelector: LSPConstants.documentSelectors,
      diagnosticCollectionName: LSPConstants.diagnosticProviderSource,
      markdown: { isTrusted: true, supportHtml: true },

      initializationFailedHandler: (error) => {
        console.log('INIT_FAIL: ', error);
        return true;
      },
      workspaceFolder: {
        index: 0,
        name: 'workspace',
        uri: workspaceUri,
      },
    },
  };

  return {
    vscodeApiConfig,
    editorAppConfig,
    workspaceUri,
    workspaceFileUri,
    reactUri,
    npmPackageUri,
    tsConfigUri,
    twinConfigUri,
    languageClientConfig,
    fileSystemProvider,
  };
};

const createDefaultWorkspaceContent = (workspacePath: string) => {
  return JSON.stringify(
    {
      folders: [
        {
          path: workspacePath,
        },
      ],
    },
    null,
    2,
  );
};

const configureMonacoWorkers = (logger?: Logger) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useWorkerFactory({
    // workerLoaders: {
    //   TextEditorWorker: () => {
    //     console.debug('LOAD_TEXT_EDITOR WORKER');
    //     return new Worker(editorWorker, { type: 'module', name: 'EditorWorker' });
    //   },
    //   TextMateWorker: () => {
    //     console.debug('LOAD_TEXTMATE WORKER');
    //     return new Worker(textMateWorker, { type: 'module', name: 'TextMateWorker' });
    //   },
    // },
    getWorkerOverride(moduleId, label) {
      console.log('REGISTER_WORKER', moduleId, label);
      switch (label) {
        // case 'json':
        //   return new jsonWorker();
        case 'typescript':
        case 'javascript':
          return new Worker(tsWorker, { type: 'module', name: 'TypescriptWorker' });
        // case 'html':
        //   return new htmlWorker();
        // case 'css':
        //   return new cssWorker();
        case 'TextMateWorker':
          return new Worker(textMateWorker, { type: 'module', name: 'TextMateWorker' });
        case 'editorWorkerService':
        case 'TextEditorWorker':
          return new Worker(editorWorker, { type: 'module', name: 'EditorWorker' });
        default:
          console.warn('OTHER_WORKER_LOAD: ', moduleId, label);
          throw new Error(`trying to load new worker: ${moduleId} label: ${label}`);
        // return new Worker(editorWorker, { type: 'module', name: 'EditorWorker' });
      }
    },
    logger,
  });
};
