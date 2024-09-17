import { useEffect, useRef } from 'react';
import { globalEditorConfig } from '@/editor/EditorConfig.service';
import { GetPackageTypings } from '@/lsp/workers/shared.schemas';
import { addPackageTypings } from '@/lsp/workers/typings.api';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';

export const useEditor = () => {
  const config = useRef(globalEditorConfig);
  const editorRef = useRef<MonacoEditorReactComp>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    addPackageTypings(twinTypings);
    return () => {
      editor.getEditorWrapper().dispose(true);
      console.log('DISPOSE');
    };
  }, []);

  return {
    config,
    editorRef,
  };
};

const twinTypings = [
  new GetPackageTypings({
    name: '@native-twin/core',
    version: '6.4.0',
  }),
  new GetPackageTypings({
    name: '@native-twin/css',
    version: '6.4.0',
  }),
  new GetPackageTypings({
    name: '@native-twin/preset-tailwind',
    version: '6.4.0',
  }),
  new GetPackageTypings({
    name: '@native-twin/arc-parser',
    version: '6.4.0',
  }),
  new GetPackageTypings({
    name: '@native-twin/helpers',
    version: '6.4.0',
  }),
];
