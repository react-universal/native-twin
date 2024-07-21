import { MixedOutput } from 'metro';
import { FileStore, CacheStore } from 'metro-cache';

export interface TwinFileService {
  getTwinCachePath(fileName: string): void;
  createFile(
    fileName: string,
    contents: string,
    options: TwinFileWriteOptions,
  ): void;
  fileExists(fileName: string): boolean;
  setFileContents(filename: string, contents: string): Buffer | null;
  filesCache?: FileStore<CacheStore<MixedOutput>>;
  setRootDir(newRootDir: string): void;
  getFile(filename: string): Buffer | null;
}

export interface TwinFileWriteOptions {
  overwrite: boolean;
}

export interface TwinFileHandlerArgs {
  projectRoot: string;
  filename: string;
  data: Buffer | string;
}
export interface TwinFileHandler  {
  service: TwinFileService;
  version: number;
  compile: boolean;
  getCurrentBuffer: () => Buffer;
  refreshFileData: (data: Buffer) => boolean;
  updateBuffer: (buffer: Buffer) => void;
}