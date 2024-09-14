import 'monaco-editor';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { install } from '@native-twin/core';
import twinConfig from '../../tailwind.config';
import { useEditor } from './useEditor';

install(twinConfig);

export function TwinEditor() {
  const { config, editorRef } = useEditor();

  return (
    <div className='flex flex-1 bg-black'>
      <MonacoEditorReactComp
        ref={editorRef}
        className='flex flex-1 w-full h-full'
        userConfig={config.current}
        style={{
          backgroundColor: 'black',
        }}
      />
    </div>
  );
}
