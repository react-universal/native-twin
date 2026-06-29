import type * as vscode from 'vscode';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import path from 'path';
import * as FileStoreDB from '../models/FileStore.models';
import { traceLayerLogs } from '../utils/logger.utils';

const make = Effect.gen(function* () {
  yield* Effect.promise(() => FileStoreDB.resetFileDB());

  const getDirectory = (uri: FileStoreDB.DirectoryPath) => {
    console.log('GET_DIR: ', uri);
    return Effect.tryPromise(() =>
      FileStoreDB.fileStoreDB.files.get([path.dirname(uri), uri]),
    ).pipe(
      Effect.andThen(Effect.fromNullable),
      Effect.catchAll((x) =>
        FileStoreDB.DirectoryDoesNotExists.create(new Error(`getDirectory: ${x.message}: ${uri}`)),
      ),
    );
  };

  const runTransactionEffect = <A, E>(effect: Effect.Effect<A, E>) =>
    Effect.tryPromise(() =>
      FileStoreDB.fileStoreDB.transaction('rw', FileStoreDB.fileStoreDB.files, () =>
        Effect.runPromise(effect),
      ),
    );

  const createDirectory = Effect.fn(function* (uri: FileStoreDB.DirectoryPath, strict = false) {
    // const parentDir = path.dirname(uri);
    // const dirParent = yield* getDirectory(FileStoreDB.DirectoryPath(parentDir));

    const exists = yield* getDirectory(uri);
    if (exists && !strict) return exists;

    console.log('EXISTS: ', exists, uri);
    return yield* Effect.tryPromise(() =>
      FileStoreDB.fileStoreDB.files.add({
        id: FileStoreDB.dirPathFromURI(URI.parse(uri)),
        content: new Uint8Array(0),
        name: FileStoreDB.dirPathFromURI(URI.parse(uri)),
        parentDir: path.dirname(uri),
        type: 'dir',
      }),
    ).pipe(
      Effect.andThen((id) => {
        console.log(
          'THEN: ',
          FileStoreDB.DirectoryPath(Array.isArray(id) ? id.join('') : id).replaceAll('/', '/'),
        );
        return getDirectory(
          FileStoreDB.DirectoryPath(Array.isArray(id) ? id.join('').replaceAll(/\//g, '/') : id),
        );
      }),
      Effect.catchAll((error) => {
        console.log('CATCHED: ', error);
        return Effect.fail(`ERROR createDirectory: ${uri} error: ${error.message}`);
      }),
    );
  });

  const createFile = Effect.fn(function* (uri: vscode.Uri, content: Uint8Array) {
    const parentDir = yield* getDirectory(FileStoreDB.DirectoryPath(path.dirname(uri.path))).pipe(
      Effect.catchAll((error) =>
        error._tag === 'db/DirectoryDoesNotExists'
          ? createDirectory(FileStoreDB.DirectoryPath(path.dirname(uri.path)))
          : Effect.fail(`Unknown error in getDirectory: ${error}`),
      ),
    );
    return yield* Effect.promise(() =>
      FileStoreDB.fileStoreDB.files.add({
        id: FileStoreDB.filePathFromURI(uri),
        type: 'file',
        parentDir: parentDir.id,
        name: FileStoreDB.filePathFromURI(uri),
        content,
      }),
    );
  });

  const listDirectory = (dirUri: vscode.Uri) =>
    FileStoreDB.fileStoreDB.files
      .where({ parentDir: FileStoreDB.dirPathFromURI(dirUri) })
      .toArray();

  const listDirectoryRecursively = (dirUri: vscode.Uri) =>
    FileStoreDB.fileStoreDB.files
      .where('parentDir')
      .startsWith(FileStoreDB.dirPathFromURI(dirUri))
      .toArray();

  const getFile = (uri: vscode.Uri) =>
    Effect.promise(() =>
      FileStoreDB.fileStoreDB.files.get([path.dirname(FileStoreDB.filePathFromURI(uri)), uri.path]),
    );

  const reportStore = () => Effect.promise(() => FileStoreDB.fileStoreDB.files.toArray());

  const cached = yield* Effect.cached(
    Effect.promise(() =>
      FileStoreDB.fileStoreDB.files.add({
        id: FileStoreDB.dirPathFromURI(URI.parse('/workspace')),
        content: new Uint8Array(0),
        name: '/workspace',
        parentDir: '/',
        type: 'dir',
      }),
    ),
  );

  yield* cached;

  return {
    reportStore,
    createFile: (uri: vscode.Uri, content: Uint8Array) => {
      return runTransactionEffect(createFile(uri, content));
    },
    createDirectory: (uri: vscode.Uri, strict = false) => {
      return runTransactionEffect(createDirectory(FileStoreDB.dirPathFromURI(uri), strict));
    },
    listDirectory,
    listDirectoryRecursively,
    getFile,
  };
});

export interface LSPStorage extends Effect.Effect.Success<typeof make> {}
export const LSPStorage = Context.GenericTag<LSPStorage>('lsp/fs-storage');
export const LSPStorageLive = Layer.effect(LSPStorage, make).pipe(traceLayerLogs('Store'));

// export const makeFSStore = Effect.gen(function* () {
//   const fs = yield* make;

//   return {
//     delete: deleteResource,
//     mkdir,
//     readdir,
//     readFile,
//     rename,
//     stat,
//     watch,
//     read,
//     writeFile,
//     cloneFile,
//     close,
//     readFileStream,
//     onDidChangeCapabilities: Event.None,
//     onDidChangeFile: Event.None,
//     onDidWatchError: Event.None,
//     capabilities:
//       FileSystemProviderCapabilities.FileReadWrite |
//       FileSystemProviderCapabilities.PathCaseSensitive |
//       FileSystemProviderCapabilities.FileReadStream,
//   } satisfies IFileSystemProviderWithFileReadWriteCapability;

//   function cloneFile(_from: URI, _to: URI): Promise<void> {
//     throw new Error('Not implemented: cloneFile');
//   }

//   function close(_fd: number): Promise<void> {
//     throw new Error('Not implemented: close');
//   }

//   function deleteResource(_resource: URI, _opts: IFileDeleteOptions): Promise<void> {
//     throw new Error('Not implemented: deleteFile');
//   }

//   function mkdir(_resource: URI): Promise<void> {
//     throw new Error('Not implemented: mkdir');
//   }

//   function readFile(_resource: URI): Promise<Uint8Array> {
//     throw new Error('Not implemented: readFile');
//   }
//   function read(
//     _fd: number,
//     _pos: number,
//     _data: Uint8Array,
//     _offset: number,
//     _length: number,
//   ): Promise<number> {
//     throw new Error('Not implemented: read');
//   }
//   function readFileStream(
//     _resource: URI,
//     _opts: IFileReadStreamOptions,
//     _token: CancellationToken,
//   ): ReadableStreamEvents<Uint8Array> {
//     console.log('TO_STREAM: ', { _resource, _opts, _token });

//     const stream = newWriteableStream<Uint8Array>(
//       (data) => VSBuffer.concat(data.map((data) => VSBuffer.wrap(data))).buffer,
//       { highWaterMark: 10 },
//     );
//     throw new Error('Not implemented: readFileStream');
//   }
//   function readdir(_resource: URI): Promise<[string, FileType][]> {
//     throw new Error('Not implemented: readdir');
//   }
//   function rename(_from: URI, _to: URI, _opts: IFileOverwriteOptions): Promise<void> {
//     throw new Error('Not implemented: rename');
//   }
//   function stat(_resource: URI): Promise<IStat> {
//     // throw new Error('Not implemented: stat');
//     return Promise.resolve({ ctime: 1, mtime: 1, size: 1, type: 1 });
//   }
//   function watch(_resource: URI, _opts: IWatchOptions): IDisposable {
//     throw new Error('Not implemented: watch');
//   }
//   function writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void> {
//     console.log('OPTS: ', opts, resource);

//     return Effect.runPromise(
//       Effect.zipRight(
//         Effect.all([
//           fs.reportStore().pipe(Effect.tap((snap) => Effect.logInfo(snap))),
//           fs.createFile(resource, content),
//         ]),
//         Effect.void,
//       ),
//     );
//   }
// });

// export const customFSProvider = makeFSStore.pipe(
//   Effect.map((x) => registerCustomProvider('file', x)),
// );

// export class CustomFs implements IFileSystemProviderWithFileReadWriteCapability {
//   onDidChangeCapabilities: vscode.Event<void>;
//   onDidChangeFile: vscode.Event<readonly IFileChange[]>;
//   onDidWatchError?: vscode.Event<string> | undefined;
//   capabilities: FileSystemProviderCapabilities =
//     FileSystemProviderCapabilities.FileReadWrite |
//     FileSystemProviderCapabilities.PathCaseSensitive |
//     FileSystemProviderCapabilities.FileReadStream;

//   constructor() {
//     this.onDidChangeCapabilities = Event.None;
//     this.onDidChangeFile = Event.None;
//     this.onDidWatchError = Event.None;
//   }

//   cloneFile(_from: URI, _to: URI): Promise<void> {
//     throw new Error('Not implemented');
//   }

//   close(_fd: number): Promise<void> {
//     throw new Error('Not implemented');
//   }

//   delete(_resource: URI, _opts: IFileDeleteOptions): Promise<void> {
//     throw new Error('Not implemented');
//   }

//   mkdir(_resource: URI): Promise<void> {
//     throw new Error('Not implemented');
//   }

//   readFile(_resource: URI): Promise<Uint8Array> {
//     throw new Error('Not implemented');
//   }

//   read(
//     _fd: number,
//     _pos: number,
//     _data: Uint8Array,
//     _offset: number,
//     _length: number,
//   ): Promise<number> {
//     throw new Error('Not implemented');
//   }
//   readFileStream(
//     _resource: URI,
//     _opts: IFileReadStreamOptions,
//     _token: CancellationToken,
//   ): ReadableStreamEvents<Uint8Array> {
//     throw new Error('Not implemented');
//   }
//   readdir(_resource: URI): Promise<[string, FileType][]> {
//     throw new Error('Not implemented');
//   }
//   rename(_from: URI, _to: URI, opts: IFileOverwriteOptions): Promise<void> {
//     throw new Error('Not implemented');
//   }
//   stat(_resource: URI): Promise<IStat> {
//     throw new Error('Not implemented');
//   }
//   watch(_resource: URI, opts: IWatchOptions): IDisposable {
//     throw new Error('Not implemented');
//   }
//   writeFile(_resource: URI, _content: Uint8Array, _opts: IFileWriteOptions): Promise<void> {
//     throw new Error('Not implemented');
//   }
// }
// }
