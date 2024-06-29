import React from 'react';
import ReactDOM from 'react-dom/client';
import Editor from '@codingame/monaco-editor-react';
import { initialize } from '@codingame/monaco-editor-wrapper';
import { useEffect, useState } from 'react';
// import '@codingame/monaco-editor-wrapper/features/extensionHostWorker';
// import '@codingame/monaco-editor-wrapper/features/workbench';
// import '@codingame/monaco-editor-wrapper/features/viewPanels';

export default function VSCode() {
  const [isReady, setIsReady] = useState(false);
  const [value, setValue] = useState('// some comment');
  // const themeColor = useThemeColor('vs-dark');
  // console.log('COLOR: ', themeColor);

  useEffect(() => {
    console.log('asdasd');
    initialize().then(() => setIsReady(true));
  }, []);
  console.log('sad', isReady);

  return isReady ? (
    <Editor
      height='auto'
      programmingLanguage='typescript'
      value={value}
      onChange={setValue}
    />
  ) : (
    <p>Loading...</p>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.createRoot(rootElement!).render(<VSCode />);
