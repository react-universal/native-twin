import * as monaco from 'monaco-editor';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import getConfigurationServiceOverride, {
  updateUserConfiguration,
} from '@codingame/monaco-vscode-configuration-service-override';
import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override';
import getLanguageDetectionOverride from '@codingame/monaco-vscode-language-detection-worker-service-override';
import getLanguagesServiceOverride from '@codingame/monaco-vscode-languages-service-override';
import { useOpenEditorStub } from 'monaco-editor-wrapper/vscode/services';
import { LanguageClientConfig, UserConfig, WrapperConfig } from 'monaco-editor-wrapper';
import { Constants } from '@native-twin/language-service/browser';
import twinConfigRaw from './content/tailwind.config?raw';
import userConfig from './config/user/configuration.json?raw';
import workerUrl from '@/lsp/workers/twin.worker?worker&url';

const createMonacoEditorConfig = () => {
  const monacoEditorConfig: monaco.editor.IStandaloneEditorConstructionOptions = {
    glyphMargin: false,
    guides: {
      bracketPairs: true,
    },
    cursorBlinking: 'smooth',
    automaticLayout: false,
    minimap: { enabled: false },
    disableMonospaceOptimizations: true,
    fontFamily: 'Fira Code',
    fontWeight: '450',
    fontLigatures: true,
  };
  const wrapperConfig: WrapperConfig = {
    serviceConfig: {
      userServices: {
        ...getEditorServiceOverride(useOpenEditorStub),
        ...getLanguagesServiceOverride(),
        ...getThemeServiceOverride(),
        ...getConfigurationServiceOverride(),
        ...getLanguageDetectionOverride(),
      },
      enableExtHostWorker: true,
      debugLogging: true,
    },
    editorAppConfig: {
      $type: 'extended',
      editorOptions: monacoEditorConfig,
      codeResources: {
        main: {
          text: twinConfigRaw,
          uri: '/tailwind.config.ts',
          fileExt: 'ts',
        },
      },
      useDiffEditor: false,
      overrideAutomaticLayout: false,
      userConfiguration: {
        json: userConfig,
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
  const monacoEditorUserConfig: UserConfig = {
    wrapperConfig: wrapperConfig,
    languageClientConfig: languageClientConfig,
    loggerConfig: {
      enabled: true,
      debugEnabled: false,
    },
  };
  updateUserConfiguration(userConfig);
  return monacoEditorUserConfig;
};

export const globalEditorConfig = createMonacoEditorConfig();
