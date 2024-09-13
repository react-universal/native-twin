import 'monaco-editor';
import React, { useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import twinConfig from '../tailwind.config';
import { createMonacoEditorConfig } from './lsp/EditorConfig.service';
import { install } from '@native-twin/core';

install(twinConfig);

const editorConfig = createMonacoEditorConfig();

export default function App() {
  const editorRef = useRef<MonacoEditorReactComp>(null);

  return (
    <div className='flex flex-1 bg-black'>
      <MonacoEditorReactComp
        ref={editorRef}
        className='flex flex-1 w-full h-full'
        userConfig={editorConfig}
        style={{
          backgroundColor: 'black',
        }}
      />
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.createRoot(rootElement!).render(<App />);
