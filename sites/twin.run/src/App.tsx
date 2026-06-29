import "vscode/localExtensionHost";
import * as vscode from "vscode";
import { RegisteredMemoryFile } from "@codingame/monaco-vscode-files-service-override";
import { typescriptDefaults } from "@codingame/monaco-vscode-standalone-typescript-language-features";
import * as BrowserRuntime from "@effect/platform-browser/BrowserRuntime";
import { setup } from "@native-twin/core";
import * as RA from "effect/Array";
import * as Effect from "effect/Effect";
import * as monaco from "monaco-editor";
import twinConfig from "../tailwind.config";
import { MainLayer } from "./services/App.runtime";
import { AppWorkers } from "./services/AppWorkers.service";
import { MonacoContext } from "./services/Monaco.service";
import { GetPackageTypings } from "./workers/shared.schemas";

const launchApp = Effect.gen(function* () {
  const { fullConfig } = yield* MonacoContext;
  const { installDefinitions } = yield* AppWorkers;

  monaco.editor.registerCommand("nativeTwin.preview", () => {
    const panel = vscode.window.createWebviewPanel("render", "asdasd", {
      viewColumn: vscode.ViewColumn.One,
    });
    panel.webview.html = getWebviewContent();

    panel.reveal();
    console.log("sldalsdj", panel);
  });

  setup(twinConfig);
  const typings = yield* installDefinitions([
    GetPackageTypings.make({
      name: "@types/react",
      version: "18.2.0",
    }),
    GetPackageTypings.make({
      name: "react",
      version: "18.2.0",
    }),
  ]);
  console.log("TYPINGS: ", RA.fromIterable(typings));
  for (const t of RA.flatten(RA.fromIterable(typings).map((x) => x.typings))) {
    const uri = vscode.Uri.file(`/workspace${t.filePath}`);
    fullConfig.fileSystemProvider.registerFile(
      new RegisteredMemoryFile(uri, t.contents)
    );
    if (t.filePath.endsWith(".ts")) {
      typescriptDefaults.addExtraLib(t.contents, t.filePath);
    }
  }
  yield* Effect.log("Started");
}).pipe(
  Effect.catchAll((error) => Effect.log("ERROR IN: ", error)),
  Effect.provide(MainLayer)
);

BrowserRuntime.runMain(launchApp, {
  disableErrorReporting: false,
  disablePrettyLogger: false,
  teardown: (exit) => {
    console.log("App exiting with: ", exit);
  },
});

function getWebviewContent() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none';">
    <title>Twin preview</title>
</head>
<body>
    <span>asdasdasd</span>
</body>
</html>`;
}
