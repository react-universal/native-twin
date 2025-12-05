import { themes } from 'prism-react-renderer';
import Frame from 'react-frame-component';
import { LiveEditor, LivePreview, LiveProvider } from 'react-live';
import { useEditorApp } from './useEditorApp';

export const EditorApp = () => {
  const { editorRef, code, css, setStage, stage } = useEditorApp();

  return (
    <div className='flex flex-1 flex-row'>
      <div ref={editorRef} id='monaco-root-editor' className='flex flex-1 w-full' />
      <div className='flex flex-1 flex-col gap-2 px-2 bg-gray-200 border-l-white border-l-1'>
        <div className='flex gap-2 px-2 border-b-1 py-2 items-center'>
          <a
            href='#'
            className='text-gray text-sm font-bold border-1 rounded-md p-1 hover:text-black'
            onClick={(e) => {
              e.preventDefault();
              setStage('preview');
            }}
          >
            Show Preview
          </a>
          <a
            href='#'
            className='text-gray text-sm font-bold border-1 rounded-md p-1'
            onClick={(e) => {
              e.preventDefault();
              setStage('css');
            }}
          >
            Show CSS out
          </a>
          <a
            href='#'
            className='text-gray text-sm font-bold border-1 rounded-md p-1'
            onClick={(e) => {
              e.preventDefault();
              setStage('config');
            }}
          >
            Show Config
          </a>
        </div>
        <Frame className='rounded-sm'>
          <div>
            <style>{css}</style>

            <LiveProvider
              code={code}
              // enableTypeScript
              // language='typescript'
              // noInline
              // theme={themes.dracula}
              // transformCode={(x) => compileCode({ css, jsx: x })}
            >
              {stage === 'preview' ? <LivePreview /> : null}
              {stage === 'css' ? <CssOutput code={css} /> : null}
              {stage === 'config' ? (
                <LiveEditor
                  disabled
                  language='typescript'
                  // theme={themes.oneDark}
                  code={code}
                />
              ) : null}
            </LiveProvider>
          </div>
        </Frame>
      </div>
    </div>
  );
};

const CssOutput = (props: { code: string }) => {
  return <LiveEditor language='css' theme={themes.vsDark} code={props.code} />;
};
