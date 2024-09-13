import * as monaco from 'monaco-editor';
import '@codingame/monaco-vscode-standalone-typescript-language-features';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { FileManager } from './FileManager';
import { monacoEditorUserConfig } from './EditorConfig.service';

export const createEditorService = () => {
  const wrapper = new MonacoEditorLanguageClientWrapper();
  const domElement = document.getElementById('monaco-editor-root')!;

  const fileManager = new FileManager(wrapper);

  return {
    editorApi: () => monaco.editor,
    languagesApi: () => monaco.languages,
    domElement,
    wrapper,
    fileManager,
    monacoEditorUserConfig,
    registerLanguages,
    setup,
  };

  async function setup() {
    await wrapper.initAndStart(monacoEditorUserConfig, domElement);
  }

  function registerLanguages() {
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
};
