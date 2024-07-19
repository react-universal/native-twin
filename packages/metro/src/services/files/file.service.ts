import fs from 'node:fs';
import path from 'node:path';
import { TWIN_CACHE_DIR } from '../../utils/constants';
import { TwinFileService, TwinFileWriteOptions } from './file.models';

export const createTwinFileService = (
  rootDir: string = process.cwd(),
): TwinFileService => {
  let currentRootDir = rootDir;

  return {
    getTwinCachePath,
    createFile: createCacheFile,
    fileExists: cacheFileExists,
    setRootDir,
    setFileContents,
    getFile,
  };

  function getFile(filename: string) {
    return fs.readFileSync(getTwinCachePath(filename));
  }

  function getTwinCachePath(fileName: string) {
    return path.resolve(path.join(currentRootDir, TWIN_CACHE_DIR, fileName));
  }

  function setFileContents(filename: string, contents: string): Buffer | null {
    if (!cacheFileExists(filename)) return null;

    fs.writeFileSync(getTwinCachePath(filename), contents);
    return readFile(filename);
  }

  function createCacheFile(
    fileName: string,
    contents = '',
    options: TwinFileWriteOptions = { overwrite: true },
  ) {
    if (!options.overwrite && cacheFileExists(fileName)) return;
    return fs.writeFileSync(getTwinCachePath(fileName), contents);
  }

  function cacheFileExists(fileName: string) {
    return fs.existsSync(getTwinCachePath(fileName));
  }

  function setRootDir(newRootDir: string) {
    currentRootDir = newRootDir;
  }

  function readFile(fileName: string) {
    return fs.readFileSync(getTwinCachePath(fileName));
  }
};
