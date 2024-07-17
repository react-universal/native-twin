import fs from 'node:fs';
import path from 'node:path';
import { TWIN_CACHE_DIR } from '../utils/constants';

interface FileWriteOptions {
  overwrite: boolean;
}
export const createTwinFileService = (rootDir: string = process.cwd()) => {
  const trackedFiles = new Map();

  return { getTwinCachePath, createCacheFile, cacheFileExists, trackedFiles };

  function getTwinCachePath(fileName: string) {
    return path.resolve(rootDir, TWIN_CACHE_DIR, fileName);
  }
  function createCacheFile(
    fileName: string,
    contents = '',
    options: FileWriteOptions = { overwrite: true },
  ) {
    if (!options.overwrite && cacheFileExists(fileName)) return;
    return fs.writeFileSync(getTwinCachePath(fileName), contents);
  }
  function cacheFileExists(fileName: string) {
    return fs.existsSync(getTwinCachePath(fileName));
  }
};
