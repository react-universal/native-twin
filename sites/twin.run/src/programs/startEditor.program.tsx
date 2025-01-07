import 'vscode';
import * as Effect from 'effect/Effect';
import ReactDOM from 'react-dom/client';
import { FileSystemService } from '../editor/services/FileSystem.service.js';
import { MonacoContext } from '../editor/services/MonacoContext.service.js';
import { EditorUIProvider } from '../ui/Editor.context.js';
import { EditorApp } from '../ui/Editor.ui.js';
import { PlaygroundLayout } from '../ui/Layout.ui.js';

export const StartEditorUIProgram = Effect.gen(function* () {
  const context = yield* MonacoContext;
  const fs = yield* FileSystemService;

  const root = ReactDOM.createRoot(context.workspace.editorDomElement);
  const App = () => {
    return (
      <EditorUIProvider app={context} fs={fs}>
        <PlaygroundLayout>
          <EditorApp />
        </PlaygroundLayout>
      </EditorUIProvider>
    );
  };
  root.render(<App />);
});
