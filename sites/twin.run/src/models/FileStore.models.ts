import type { Uri } from 'vscode';
import path from 'node:path';
import Dexie, { type Table } from 'dexie';
import logger, { LogType } from 'dexie-logger';
import * as Brand from 'effect/Brand';
import * as Data from 'effect/Data';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'dir';
  content: Uint8Array;
  parentDir: string | null;
}

export type DirectoryPath = string & Brand.Brand<'_dirPath'>;
export const DirectoryPath = Brand.refined<DirectoryPath>(
  (raw) => path.extname(raw) === '',
  (x) => Brand.error(`Expected dirpath but got: ${x}`),
);

export type ParentDir = string & Brand.Brand<'_parentDir'>;
export const ParentDir = Brand.refined<ParentDir>(
  (raw) => path.extname(raw) === '',
  (x) => Brand.error(`Expected dirpath but got: ${x}`),
);
const parentDir = Brand.all(DirectoryPath, ParentDir);

export type FilePath = string & Brand.Brand<'_filePath'>;
export const FilePath = Brand.refined<FilePath>(
  (raw) => path.extname(raw) !== '',
  (x) => Brand.error(`Expected filePath but got: ${x}`),
);

export const dirPathFromURI = (uri: Uri) => {
  return DirectoryPath(uri.path);
};

export const filePathFromURI = (uri: Uri) => {
  return FilePath(uri.path);
};

export const parentDirFromUri = (uri: Uri) => {
  return parentDir(uri.path);
};

export const fileIDFromUri = (uri: Uri) => uri.path;
export class FileStoreDB extends Dexie {
  files!: Table<FileItem, string>;
  constructor() {
    super('TwinFileStore');
    this.version(1).stores({
      files: '[parentDir+name], parentDir',
    });
  }

  deleteFile(id: string) {
    return this.transaction('rw', this.files, () => {
      this.files.where({ id }).delete();
    });
  }
}

export const fileStoreDB = new FileStoreDB();
fileStoreDB.use(logger({ logType: LogType.Default }));

export const resetFileDB = () => {
  return fileStoreDB.transaction('rw', fileStoreDB.files, async () => {
    await Promise.all(fileStoreDB.tables.map((table) => table.clear()));
  });
};

export class FileAlreadyExist extends Data.TaggedError('db/FileAlreadyExist')<{
  cause: Error;
}> {
  get stackTrace() {
    return this.cause.stack ?? Error.captureStackTrace(this.cause);
  }
  static create(cause: unknown) {
    if (cause instanceof Error) return new FileAlreadyExist({ cause: cause });
    return new FileAlreadyExist({ cause: new Error(cause as string) });
  }
}

export class FileDoesNotExists extends Data.TaggedError('db/FileDoesNotExists')<{
  cause: Error;
}> {
  get stackTrace() {
    return this.cause.stack ?? Error.captureStackTrace(this.cause);
  }
  static create(cause: unknown) {
    if (cause instanceof Error) return new FileDoesNotExists({ cause: cause });
    return new FileDoesNotExists({ cause: new Error(cause as string) });
  }
}

export class DirectoryAlreadyExists extends Data.TaggedError('db/DirectoryAlreadyExists')<{
  cause: Error;
}> {
  get stackTrace() {
    return this.cause.stack ?? Error.captureStackTrace(this.cause);
  }
  static create(cause: unknown) {
    if (cause instanceof Error) return new DirectoryAlreadyExists({ cause: cause });
    return new DirectoryAlreadyExists({ cause: new Error(cause as string) });
  }
}

export class DirectoryDoesNotExists extends Data.TaggedError('db/DirectoryDoesNotExists')<{
  cause: Error;
}> {
  get stackTrace() {
    return this.cause.stack ?? Error.captureStackTrace(this.cause);
  }
  static create(cause: unknown) {
    if (cause instanceof Error) return new DirectoryDoesNotExists({ cause: cause });
    return new DirectoryDoesNotExists({ cause: new Error(cause as string) });
  }
}
