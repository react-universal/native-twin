import 'monaco-editor';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { install } from '@native-twin/core';
import twinConfig from '../../tailwind.config';
import { useEditor } from './useEditor';

install(twinConfig);

export function TwinEditor() {
  const { config, editorRef } = useEditor();

  return (
    <div className='flex flex-1 flex-col bg-black'>
      <div className='flex flex-row bg-gray-500'>
        <div className='flex justify-center items-center'>
          <a
            href='/#'
            className='flex text(white)'
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            CSS
          </a>
        </div>
      </div>
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
