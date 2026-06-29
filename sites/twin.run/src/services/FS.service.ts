import * as vscode from 'vscode';
import { ITextFileService } from '@codingame/monaco-vscode-api';
import type { IDisposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import type { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import {
  RegisteredFileSystemProvider,
  RegisteredMemoryFile,
  registerFileSystemOverlay,
} from '@codingame/monaco-vscode-files-service-override';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Ref from 'effect/Ref';
import { traceLayerLogs } from '../utils/logger.utils';
import * as Store from './LSP.store';

// const options: IFileWriteOptions = {
//   atomic: false,
//   unlock: false,
//   create: true,
//   overwrite: true,
// };

const make = Effect.gen(function* () {
  const fileSystemProvider = new RegisteredFileSystemProvider(false);
  // const store =
  // yield* Store.LSPStorage;
  const workspaceUri = vscode.Uri.file('/workspace');
  const workspaceFileUri = vscode.Uri.file('/workspace.code-workspace');

  const createFileInMemory = (uri: vscode.Uri, contents: string) => {
    return new RegisteredMemoryFile(uri, contents);
  };

  const subscriptions = yield* Ref.make<IDisposable[]>([]);
  const getPathUri = (filename: string) => vscode.Uri.file(`/workspace/${filename}`);

  const baseFilesUri = {
    react: getPathUri('Component.tsx'),
    npmPackage: getPathUri('package.json'),
    tsConfig: getPathUri('tsconfig.json'),
    twinConfig: getPathUri('tailwind.config.ts'),
  };

  yield* Effect.sync(() =>
    fileSystemProvider.registerFile(
      createFileInMemory(workspaceFileUri, createDefaultWorkspaceContent('/workspace')),
    ),
  );

  const addSubscription = (disposable: IDisposable) =>
    Ref.update(subscriptions, (x) => [...x, disposable]);

  const createFile = Effect.fn(function* (uri: URI, content: string) {
    yield* Effect.sync(() => fileSystemProvider.registerFile(createFileInMemory(uri, content)));
  });

  const readFile = (uri: URI) =>
    Effect.promise(() => fileSystemProvider.readFile(uri)).pipe(
      Effect.map((bytes) => Buffer.from(bytes).toString('utf-8')),
    );

  // yield* Effect.sync(() => registerFileSystemOverlay(1, fileSystemProvider)).pipe(
  //   Effect.tap(addSubscription),
  // );

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

});

export interface MonacoFs extends Effect.Effect.Success<typeof make> {}
export const MonacoFs = Context.GenericTag<MonacoFs>('monaco/FS');
export const MonacoFsLive = Layer.effect(MonacoFs, make).pipe(traceLayerLogs('FS'));

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
