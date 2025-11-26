import * as vscode from 'vscode';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import { VscodeContext } from '../extension/extension.service';
import * as fsPredicates from './fs.predicates';
import {
  createVirtualEntryID,
  type VirtualEntryTreeNode,
  type VirtualEntryTreeRoot,
  type VirtualEntryType,
  type VirtualFile,
} from './models/FileSystem.models.js';

export const findEntryByUri = (
  root: VirtualEntryTreeRoot,
  uri: vscode.Uri,
): VirtualEntryTreeNode<VirtualEntryType> => {
  return pipe(
    root.all(),
    RA.findFirst(({ value }) => fsPredicates.isSameEntryID(value.id, createVirtualEntryID(uri))),
    Option.getOrThrowWith(() => vscode.FileSystemError.FileNotADirectory(uri)),
  );
};

export const findVirtualFolder = (
  root: VirtualEntryTreeRoot,
  uri: vscode.Uri,
): VirtualEntryTreeNode<VirtualEntryType> => {
  const foundEntry = findEntryByUri(root, uri);

  if (!fsPredicates.isVirtualDirectoryNode(foundEntry)) {
    throw vscode.FileSystemError.FileNotADirectory(uri);
  }

  return foundEntry;
};

export const findVirtualFile = (
  root: VirtualEntryTreeRoot,
  uri: vscode.Uri,
): VirtualEntryTreeNode<VirtualFile> => {
  const foundEntry = findEntryByUri(root, uri);

  if (!fsPredicates.isVirtualFileNode(foundEntry)) {
    throw vscode.FileSystemError.FileIsADirectory(uri);
  }

  return foundEntry;
};

// export const getTwinTextDocumentByUri = (
//   uri: vscode.Uri,
//   config: TwinConfigOptions,
// ) => {
//   const vsDocument = RA.findFirst(
//     vscode.workspace.textDocuments,
//     (x) => x.uri.toString() === uri.toString(),
//   ).pipe(Option.getOrThrow);
//   const twinDocument = new TwinLSPDocument(vsDocument, []);

//   const languageRanges = RA.map(twinDocument.getLanguageRegions(config), (region) => {
//     return twinDocument.babelLocationToVscode(region);
//   });

//   return {
//     languageRanges,
//     twinDocument,
//   };
// };

// export const getTwinObservedFiles = Effect.gen(function* () {
//   const twin = yield* NativeTwinManagerService;

//   return yield* Stream.fromIterable(twin.tw.config.content).pipe(
//     Stream.mapEffect((x) => thenable(() => vscode.workspace.findFiles(path.join(x)))),
//     Stream.flattenIterables,
//     Stream.filter((uri) => twin.isAllowedPath(uri.path)),
//     Stream.runCollect,
//     Effect.map(Chunk.toArray),
//   );
// });

export const getVscodeFS = Effect.gen(function* () {
  const ctx = yield* VscodeContext;
  // const validTextFiles = yield* getTwinObservedFiles;
  const watcher = vscode.workspace.createFileSystemWatcher('**/*');

  ctx.subscriptions.push(watcher);

  return {
    validTextFiles: [] as vscode.Uri[],
    watcher,
  };
});
