import * as Effect from "effect/Effect";
import ReactDOM from "react-dom/client";

export const runApp = () => {
  const root = ReactDOM.createRoot(
    document.getElementById("monaco-editor-root")!
  );
  const App = () => {
    return (
      <div>
        <div>
          <span>asdasdadsdsad</span>
        </div>
      </div>
    );
  };
  root.render(<App />);
};
