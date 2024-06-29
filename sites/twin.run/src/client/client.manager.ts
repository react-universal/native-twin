import * as monaco from 'monaco-editor';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
import getConfigurationServiceOverride from '@codingame/monaco-vscode-configuration-service-override';
import { rollup } from '@rollup/browser';
import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override';
// import getEditorViewsOverride from '@codingame/monaco-vscode-views-service-override';
// import getOutputServiceOverride from '@codingame/monaco-vscode-output-service-override';
import getLifecycleServiceOverride from '@codingame/monaco-vscode-lifecycle-service-override';
import getLanguagesServiceOverride from '@codingame/monaco-vscode-languages-service-override';
import getFilesServiceOverride from '@codingame/monaco-vscode-files-service-override';
// import getExplorerServiceOverride from '@codingame/monaco-vscode-explorer-service-override';
import getExtensionServiceOverride from '@codingame/monaco-vscode-extensions-service-override';
// import getViewsServiceOverride from '@codingame/monaco-vscode-views-service-override';
import { useOpenEditorStub } from 'monaco-editor-wrapper/vscode/services';
import { createConverter as createCodeConverter } from 'vscode-languageclient/lib/common/codeConverter.js';
import { createConverter as createProtocolConverter } from 'vscode-languageclient/lib/common/protocolConverter.js';
import {
  LanguageClientConfig,
  MonacoEditorLanguageClientWrapper,
  UserConfig,
  WrapperConfig,
} from 'monaco-editor-wrapper';
import * as Constants from '@native-twin/language-service/src/utils/constants.utils';
import { FileManager } from './file.manager';
import { MonacoLanguageClient } from 'monaco-languageclient';
import { workerConfig } from '../workers/extensions.worker';
import twinConfigRaw from '../content/tailwind.config?raw';

export class ClientManager {
  readonly codeConverter = createCodeConverter();
  readonly protocolConverter = createProtocolConverter(undefined, true, true);
  readonly wrapper = new MonacoEditorLanguageClientWrapper();
  readonly fileManager = new FileManager();

  constructor() {}

  async setup() {
    await this.wrapper.initAndStart(this.userConfig, this.HTMLElement);
    this.fileManager.setup();
  }

  async compileCode(_code: string) {
    const modules = {
      'main.js': "import foo from 'foo.js'; console.log(foo);",
      'foo.js': 'export default 42;',
    };

    const compiler = await rollup({
      input: 'main.js',
      plugins: [
        {
          name: 'loader',
          resolveId(source) {
            if (modules.hasOwnProperty(source)) {
              return source;
            }
            return '';
          },
          load(id) {
            if (modules.hasOwnProperty(id)) {
              // @ts-expect-error
              return modules?.[id];
            }
          },
        },
      ],
    });
    const generated = await compiler.generate({ format: 'es' });
    return generated;
  }

  registerLanguages() {
    monaco.languages.register({
      id: 'typescript',
      extensions: ['.ts', '.tsx'],
      aliases: ['ts', 'TS', 'tsx'],
      mimetypes: ['text/typescript', 'text/javascript'],
    });
    monaco.languages.register({
      id: 'javascript',
      extensions: ['.js', '.jsx'],
      aliases: ['js', 'JS', 'jsx'],
      mimetypes: ['plain/text', 'text/javascript'],
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
    return {
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
        $type: 'WebSocket',
        host: 'localhost',
        port: 30001,
        path: 'twin',
        extraParams: {
          authorization: 'UserAuth',
        },
        secured: false,
        startOptions: {
          onCall: (languageClient?: MonacoLanguageClient) => {
            setTimeout(() => {
              // console.log('LS: ', languageClient);
              if (languageClient) {
                languageClient.onRequest('nativeTwinInitialized', (x) => {
                  console.log('REQUEST: ', x);
                  return { t: true };
                });
              }
            }, 250);
          },
          reportStatus: true,
        },
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
          // ...getOutputServiceOverride(),
          ...getEditorServiceOverride(useOpenEditorStub),
          ...getLifecycleServiceOverride(),
          ...getFilesServiceOverride(),
          ...getConfigurationServiceOverride(),
          ...getTextmateServiceOverride(),
          ...getThemeServiceOverride(),
          // ...getExplorerServiceOverride(),
          ...getLanguagesServiceOverride(),
          // ...getStorageServiceOverride(),
          // ...getEditorViewsOverride(),
          // ...getViewsServiceOverride(),
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
  }
}

export const clientManager = new ClientManager();
