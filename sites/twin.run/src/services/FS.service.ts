import * as vscode from 'vscode';
import type { IDisposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import type { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import {
  type IFileWriteOptions,
  InMemoryFileSystemProvider,
  registerFileSystemOverlay,
} from '@codingame/monaco-vscode-files-service-override';
import { Buffer } from 'buffer';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Ref from 'effect/Ref';
import reactFileText from '../fixtures/react/Basic.react?raw';
// import editorUserConfigJSON from '../fixtures/editor-config/configuration.json?raw';
import twinConfigRaw from '../fixtures/tailwind-configs/tailwind-preset.config?raw';
import npmPkgRaw from '../fixtures/typescript/package.editor.json?raw';
import tsconfigRaw from '../fixtures/typescript/tsconfig.editor.json?raw';

const options: IFileWriteOptions = {
  atomic: false,
  unlock: false,
  create: true,
  overwrite: true,
};

const encoder = new TextEncoder();
const make = Effect.gen(function* () {
  const workspaceUri = vscode.Uri.file('/workspace');
  const workspaceFileUri = vscode.Uri.file('/workspace.code-workspace');
  // const indexDB = yield* Effect.promise(() => IndexedDB.create('twin', 1, []));

  const fileSystemProvider = new InMemoryFileSystemProvider();
  const subscriptions = yield* Ref.make<IDisposable[]>([]);
  const getPathUri = (filename: string) => vscode.Uri.file(`/workspace/${filename}`);

  const baseFilesUri = {
    react: getPathUri('Component.tsx'),
    npmPackage: getPathUri('package.json'),
    tsConfig: getPathUri('tsconfig.json'),
    twinConfig: getPathUri('tailwind.config.ts'),
  };

  yield* Effect.promise(() => fileSystemProvider.mkdir(workspaceUri)).pipe(
    Effect.tapBoth({
      onFailure: (error) => Effect.log('ERROR:', error),
      onSuccess: (c) => Effect.log('SUCCESS', c),
    }),
  );

  const addSubscription = (disposable: IDisposable) =>
    Ref.update(subscriptions, (x) => [...x, disposable]);

  const createFile = Effect.fn(function* (uri: URI, content: string) {
    yield* Effect.promise(() =>
      fileSystemProvider.writeFile(uri, encoder.encode(content), options),
    );
    // yield* addSubscription(disposable);
  });

  const readFile = (uri: URI) =>
    Effect.promise(() => fileSystemProvider.readFile(uri)).pipe(
      Effect.map((bytes) => Buffer.from(bytes).toString('utf-8')),
    );

  yield* Effect.sync(() => registerFileSystemOverlay(1, fileSystemProvider)).pipe(
    Effect.tap(addSubscription),
  );

  yield* createBaseFiles();

  return {
    createFile,
    readFile,
    addSubscription,
    fileSystemProvider,
    subscriptions,
    paths: {
      workspaceUri,
      workspaceFileUri,
      getPathUri,
      ...baseFilesUri,
    },
  };

  function createBaseFiles() {
    return Effect.all([
      createFile(baseFilesUri.react, reactFileText),
      createFile(baseFilesUri.npmPackage, npmPkgRaw),
      createFile(baseFilesUri.tsConfig, tsconfigRaw),
      createFile(baseFilesUri.twinConfig, twinConfigRaw),
    ]);
  }
});

export interface MonacoFs extends Effect.Effect.Success<typeof make> {}
export const MonacoFs = Context.GenericTag<MonacoFs>('monaco/FS');
export const MonacoFsLive = Layer.effect(MonacoFs, make).pipe(
  Layer.tapError((error) => Effect.log('CAP_ERROR_FS: ', error)),
);

export const createDefaultWorkspaceContent = (workspacePath: string) => {
  return JSON.stringify(
    {
      folders: [
        {
          path: workspacePath,
        },
      ],
    },
    null,
    2,
  );
};
