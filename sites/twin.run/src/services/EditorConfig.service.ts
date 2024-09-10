import * as monaco from 'monaco-editor';
import { UserConfig, WrapperConfig } from 'monaco-editor-wrapper';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
import getConfigurationServiceOverride from '@codingame/monaco-vscode-configuration-service-override';
import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override';
import getEditorViewsOverride from '@codingame/monaco-vscode-views-service-override';
import getLifecycleServiceOverride from '@codingame/monaco-vscode-lifecycle-service-override';
import getLanguagesServiceOverride from '@codingame/monaco-vscode-languages-service-override';
import getFilesServiceOverride from '@codingame/monaco-vscode-files-service-override';
import getExplorerServiceOverride from '@codingame/monaco-vscode-explorer-service-override';
import getExtensionServiceOverride from '@codingame/monaco-vscode-extensions-service-override';
import { useOpenEditorStub } from 'monaco-editor-wrapper/vscode/services';
import { LanguageClientConfig } from 'monaco-editor-wrapper';
import { Constants } from '@native-twin/language-service/browser';
import { workerConfig } from '../workers/extensions.worker';
import twinConfigRaw from '../content/tailwind.config?raw';
import workerUrl from '../workers/twin.worker?worker&url';

export const createEditorConfig = () => {
  const monacoEditorConfig: monaco.editor.IStandaloneEditorConstructionOptions = {
    glyphMargin: true,
    guides: {
      bracketPairs: true,
    },
    lightbulb: {
      enabled: monaco.editor.ShowLightbulbIconMode.On,
    },
    theme: 'vs-dark',
  };
  const monacoDiffEditorConfig = {
    ...monacoEditorConfig,
    renderSideBySide: false,
  };
  const wrapperConfig: WrapperConfig = {
    serviceConfig: {
      userServices: {
        ...getExtensionServiceOverride(workerConfig),
        // ...getOutputServiceOverride(),
        ...getEditorServiceOverride(useOpenEditorStub),
        ...getLifecycleServiceOverride(),
        ...getFilesServiceOverride(),
        ...getConfigurationServiceOverride(),
        ...getTextmateServiceOverride(),
        ...getThemeServiceOverride(),
        ...getExplorerServiceOverride(),
        ...getLanguagesServiceOverride(),
        // ...getStorageServiceOverride(),
        ...getEditorViewsOverride(),
      },
      enableExtHostWorker: true,
      debugLogging: true,
    },
    editorAppConfig: {
      $type: 'extended',
      diffEditorOptions: monacoDiffEditorConfig,
      editorOptions: {
        ...monacoEditorConfig,
      },
      codeResources: {
        main: {
          text: twinConfigRaw,
          uri: '/workspace/tailwind.config.ts',
          enforceLanguageId: 'typescript',
        },
      },
      useDiffEditor: false,
      overrideAutomaticLayout: true,

      userConfiguration: {
        json: JSON.stringify({
          'workbench.colorTheme': 'Default Dark Modern',
        }),
      },
    },
  };

  const languageClientConfig: LanguageClientConfig = {
    languageId: 'typescript',
    clientOptions: {
      documentSelector: Constants.DOCUMENT_SELECTORS,
      initializationOptions: {
        capabilities: {
          completion: {
            dynamicRegistration: false,
            completionItem: {
              snippetSupport: true,
            },
          },
        },
      },
    },
    name: 'Twin language client',
    options: {
      $type: 'WorkerDirect',
      worker: new Worker(workerUrl, {
        type: 'module',
        name: 'twin.worker',
      }),
    },
  };
  const userConfig: UserConfig = {
    wrapperConfig: wrapperConfig,
    languageClientConfig: languageClientConfig,
    loggerConfig: {
      enabled: true,
      debugEnabled: true,
    },
  };

  return {
    userConfig,
  };
};
