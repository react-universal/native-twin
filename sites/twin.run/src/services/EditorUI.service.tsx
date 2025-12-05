import * as Effect from "effect/Effect";
import ReactDOM from "react-dom/client";
import { EditorApp } from "../ui/Editor.ui";
import { PlaygroundLayout } from "../ui/Layout.ui";

export const StartEditorUIProgram = Effect.gen(function* () {

  // yield* Effect.log(context.wrapper.getTextModels());
  const root = ReactDOM.createRoot(document.getElementById("twin-editor")!);
  const App = () => {
    return (
      <PlaygroundLayout>
        <EditorApp />
      </PlaygroundLayout>
    );
  };
  root.render(<App />);
});
