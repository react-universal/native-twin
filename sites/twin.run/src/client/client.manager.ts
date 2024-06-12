import * as monaco from 'monaco-editor';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
import getConfigurationServiceOverride from '@codingame/monaco-vscode-configuration-service-override';
import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override';
import getOutputServiceOverride from '@codingame/monaco-vscode-output-service-override';
import getLifecycleServiceOverride from '@codingame/monaco-vscode-lifecycle-service-override';
import getLanguagesServiceOverride from '@codingame/monaco-vscode-languages-service-override';
import getFilesServiceOverride from '@codingame/monaco-vscode-files-service-override';
import getExplorerServiceOverride from '@codingame/monaco-vscode-explorer-service-override';
import getExtensionServiceOverride from '@codingame/monaco-vscode-extensions-service-override';
import getViewsServiceOverride from '@codingame/monaco-vscode-views-service-override';
import { useOpenEditorStub } from 'monaco-editor-wrapper/vscode/services';
import { createConverter as createCodeConverter } from 'vscode-languageclient/lib/common/codeConverter.js';
import { createConverter as createProtocolConverter } from 'vscode-languageclient/lib/common/protocolConverter.js';
import {
  LanguageClientConfig,
  MonacoEditorLanguageClientWrapper,
  UserConfig,
  WrapperConfig,
} from 'monaco-editor-wrapper';
import {
  BrowserMessageReader,
  BrowserMessageWriter,
} from 'vscode-languageclient/browser.js';
import { loadTwinWorker } from '..';
import * as Constants from '@native-twin/language-server/src/utils/constants.utils';
import { FileManager } from './file.manager';
import { workerConfig } from '../workers/extensions.worker';

export class ClientManager {
  readonly codeConverter = createCodeConverter();
  readonly protocolConverter = createProtocolConverter(undefined, true, true);
  readonly wrapper = new MonacoEditorLanguageClientWrapper();
  readonly fileManager = new FileManager();

  constructor() {}

  async setup() {
    await this.wrapper.init(this.userConfig);
    this.fileManager.setup();
  }

  registerLanguages() {
    monaco.languages.register({
      id: 'json',
      extensions: ['.json', '.jsonc'],
      aliases: ['JSON', 'json'],
      mimetypes: ['application/json'],
    });
    monaco.languages.register({
      id: 'typescript',
      extensions: ['.ts', '.tsx'],
      aliases: ['ts', 'TS', 'tsx'],
      mimetypes: ['application/text'],
    });
    monaco.languages.register({
      id: 'javascript',
      extensions: ['.js', '.jsx'],
      aliases: ['js', 'JS', 'jsx'],
      mimetypes: ['application/text'],
    });
  }

  get HTMLElement() {
    return document.getElementById('monaco-editor-root');
  }

  get userConfig(): UserConfig {
    return {
      wrapperConfig: this.wrapperConfig,
      languageClientConfig: this.languageClientConfig,
      loggerConfig: {
        enabled: true,
        debugEnabled: true,
      },
    };
  }

  get languageClientConfig(): LanguageClientConfig {
    const twinWorker = loadTwinWorker();
    const reader = new BrowserMessageReader(twinWorker);
    const writer = new BrowserMessageWriter(twinWorker);

    return {
      languageId: 'nativeTwin',
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
        worker: twinWorker,
      },
      connectionProvider: {
        get: async () => ({
          reader: reader,
          writer: writer,
        }),
      },
    };
  }

  get wrapperConfig(): WrapperConfig {
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
    return {
      serviceConfig: {
        userServices: {
          ...getExtensionServiceOverride(workerConfig),
          ...getOutputServiceOverride(),
          ...getEditorServiceOverride(useOpenEditorStub),
          ...getLifecycleServiceOverride(),
          ...getFilesServiceOverride(),
          ...getConfigurationServiceOverride(),
          ...getTextmateServiceOverride(),
          ...getThemeServiceOverride(),
          ...getExplorerServiceOverride(),
          ...getLanguagesServiceOverride(),
          // ...getStorageServiceOverride(),
          ...getViewsServiceOverride(),
        },
        // enableExtHostWorker: true,
        debugLogging: true,
        workspaceConfig: {
          productConfiguration: {},
        },
      },
      editorAppConfig: {
        $type: 'extended',
        diffEditorOptions: monacoDiffEditorConfig,
        editorOptions: {
          ...monacoEditorConfig,
        },
        codeResources: {
          main: {
            text: this.fileManager.code,
            uri: this.fileManager.codeUri,
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
  }
}

export const clientManager = new ClientManager();
