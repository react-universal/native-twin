import { useEditorApp } from "./useEditorApp";

export const EditorApp = () => {
  const { editorRef } = useEditorApp();

  return <div ref={editorRef} className="flex flex-1 flex-row"></div>;
};
