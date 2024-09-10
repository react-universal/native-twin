import * as monaco from 'monaco-editor';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { FileManager } from '../client/file.manager';
import { createEditorConfig } from './EditorConfig.service';

export const createEditorService = () => {
  const wrapper = new MonacoEditorLanguageClientWrapper();
  const domElement = document.getElementById('monaco-editor-root')!;
  const editorConfig = createEditorConfig();

  const fileManager = new FileManager();
  return {
    editorApi: () => monaco.editor,
    languagesApi: () => monaco.languages,
    domElement,
    wrapper,
    fileManager,
    registerLanguages,
    setup,
  };

  async function setup() {
    await wrapper.initAndStart(editorConfig.userConfig, domElement);
    fileManager.setup();
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
