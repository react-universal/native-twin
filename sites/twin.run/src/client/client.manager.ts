import * as monaco from 'monaco-editor';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
import getConfigurationServiceOverride from '@codingame/monaco-vscode-configuration-service-override';
import { rollup } from '@rollup/browser';
import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override';
import getEditorViewsOverride from '@codingame/monaco-vscode-views-service-override';
import getLifecycleServiceOverride from '@codingame/monaco-vscode-lifecycle-service-override';
import getLanguagesServiceOverride from '@codingame/monaco-vscode-languages-service-override';
import getFilesServiceOverride from '@codingame/monaco-vscode-files-service-override';
import getExplorerServiceOverride from '@codingame/monaco-vscode-explorer-service-override';
import getExtensionServiceOverride from '@codingame/monaco-vscode-extensions-service-override';
import { useOpenEditorStub } from 'monaco-editor-wrapper/vscode/services';
import { createConverter as createCodeConverter } from 'vscode-languageclient/lib/common/codeConverter.js';
import { createConverter as createProtocolConverter } from 'vscode-languageclient/lib/common/protocolConverter.js';
import {
  LanguageClientConfig,
  MonacoEditorLanguageClientWrapper,
  UserConfig,
  WrapperConfig,
} from 'monaco-editor-wrapper';
import { Constants } from '@native-twin/language-service/browser';
import { FileManager } from '../lsp/FileManager';
import { workerConfig } from '../lsp/workers/extensions.worker';
import twinConfigRaw from '../content/tailwind.config?raw';
import workerUrl from '../workers/twin.worker?worker&url';

export class ClientManager {
  readonly codeConverter = createCodeConverter();
  readonly protocolConverter = createProtocolConverter(undefined, true, true);
  readonly wrapper = new MonacoEditorLanguageClientWrapper();
  readonly fileManager = new FileManager(this.wrapper);

  async setup() {
    await this.wrapper.initAndStart(this.userConfig, this.HTMLElement);
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
        $type: 'WorkerDirect',
        worker: new Worker(workerUrl, {
          type: 'module',
          name: 'twin.worker',
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
            fileExt: '.ts',
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
