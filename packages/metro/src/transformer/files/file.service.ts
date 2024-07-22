import { Effect, Layer } from 'effect';
import * as Context from 'effect/Context';
import fs from 'node:fs';
import path from 'node:path';
import { TWIN_CACHE_DIR } from '../../utils/constants';
import { MetroTransformContext } from '../transformer.service';
import { TwinFileService, TwinFileWriteOptions } from './file.models';

export class FileService extends Context.Tag('cache/FileService')<
  FileService,
  TwinFileService
>() {}

export const FileServiceLive = Layer.scoped(
  FileService,
  Effect.gen(function* () {
    const { options } = yield* MetroTransformContext;
    return {
      createFile: createCacheFile,
      fileExists: cacheFileExists,
      getFile,
      getTwinCachePath,
      setFileContents,
    };
    function getFile(filename: string) {
      return fs.readFileSync(getTwinCachePath(filename));
    }

    function getTwinCachePath(fileName: string) {
      return path.resolve(path.join(options.projectRoot, TWIN_CACHE_DIR, fileName));
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

    function readFile(fileName: string) {
      return fs.readFileSync(getTwinCachePath(fileName));
    }
  }),
);
