import { __Theme__, TailwindConfig } from '@native-twin/core';
import { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import { TwinFileHandler, TwinFileHandlerArgs } from './file.models';
import { createTwinFileService } from './file.service';

export type FileHandlerFn = (handler: TwinFileHandlerArgs) => TwinFileHandler;
export const opaqueCache = new Map<string, TwinFileHandler>();
export let twinConfig: TailwindConfig<__Theme__ & TailwindPresetTheme>;

export function getOrCreateTwinFileHandler(data: TwinFileHandlerArgs) {
  if (!opaqueCache.has(data.filename)) {
    const fileHandler = createTwinFile(data);
    opaqueCache.set(data.filename, fileHandler);
  } else {
    const handler = opaqueCache.get(data.filename)!;
    handler.refreshFileData(ensureBuffer(data.data));
  }

  return opaqueCache.get(data.filename)!;
}

export const createTwinFile = ({
  projectRoot,
  data,
  filename,
}: TwinFileHandlerArgs): TwinFileHandler => {
  const service = createTwinFileService(projectRoot);

  const state = {
    service,
    version: 1,
    getCurrentBuffer,
    refreshFileData,
    updateBuffer,
    compile: true,
    currentBuffer: ensureBuffer(data),
    filename,
  };
  return state;

  function refreshFileData(data: Buffer) {
    const sameData = isSameData(data);
    if (sameData) {
      return false;
    }
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

    opaqueCache.set(state.filename, {
      ...state,
      version: state.version + 1,
    });
  }
};

function ensureBuffer(file: Buffer | string): Buffer {
  return Buffer.isBuffer(file) ? file : Buffer.from(file, 'utf8');
}
