import { __Theme__, TailwindConfig } from '@native-twin/core';
import { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import { TwinFileHandler, TwinFileHandlerArgs } from './file.models';
import { createTwinFileService } from './file.service';

export type FileHandlerFn = (handler: TwinFileHandlerArgs) => TwinFileHandler;
export const opaqueCache = new Map<string, TwinFileHandler>();
export let twinConfig: TailwindConfig<__Theme__ & TailwindPresetTheme>;

export function getOrCreateTwinFileHandler(data: TwinFileHandlerArgs) {
  let handler: TwinFileHandler;
  if (opaqueCache.has(data.filename)) {
    handler = opaqueCache.get(data.filename)!;
    if (handler.refreshFileData(ensureBuffer(data.data))) {
      handler.version = handler.version + 1;
    }
    // console.log('FROM_CACHE', {
    //   size: opaqueCache.size,
    //   entries: opaqueCache,
    //   data,
    // });
  } else {
    const fileHandler = createTwinFile(data);
    opaqueCache.set(data.filename, fileHandler);
    handler = fileHandler;
  }

  return handler;
}

export const createTwinFile = ({
  projectRoot,
  data,
}: TwinFileHandlerArgs): TwinFileHandler => {
  const service = createTwinFileService(projectRoot);

  let compile = true;
  let state = {
    service,
    version: 1,
    getCurrentBuffer,
    refreshFileData,
    updateBuffer,
    compile,
    currentBuffer: ensureBuffer(data),
  };
  return state;

  function refreshFileData(data: Buffer) {
    const sameData = isSameData(data);
    if (sameData) {
      return false;
    }
    compile = true;
    updateBuffer(data);

    return true;
  }

  function isSameData(data: Buffer) {
    return state.getCurrentBuffer().equals(data);
  }

  function getCurrentBuffer() {
    return state.currentBuffer;
  }

  function updateBuffer(newBuffer: Buffer) {
    state.currentBuffer = ensureBuffer(newBuffer);
    state = {
      ...state,
      version: state.version + 1,
    };
  }
};

function ensureBuffer(file: Buffer | string): Buffer {
  return Buffer.isBuffer(file) ? file : Buffer.from(file, 'utf8');
}
