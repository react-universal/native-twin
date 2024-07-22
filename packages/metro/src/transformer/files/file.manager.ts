// import type { __Theme__ } from '@native-twin/core';
// import { ensureBuffer } from '../../utils/file.utils';
// import type { TwinFileHandler, TwinFileHandlerArgs } from './file.models';

// export type FileHandlerFn = (handler: TwinFileHandlerArgs) => TwinFileHandler;
// const cache = new Map<string, TwinFileHandler>();

// export function getOrCreateTwinFileHandler(data: TwinFileHandlerArgs) {
//   if (!cache.has(data.filename)) {
//     const fileHandler = createTwinFile(data);
//     cache.set(data.filename, fileHandler);
//   } else {
//     const handler = cache.get(data.filename)!;
//     handler.refreshFileData(ensureBuffer(data.data));
//   }

//   return cache.get(data.filename)!;
// }

// export const createTwinFile = ({
//   projectRoot,
//   data,
//   filename,
// }: TwinFileHandlerArgs): TwinFileHandler => {
//   const service = createTwinFileService(projectRoot);

//   const state = {
//     service,
//     version: 1,
//     getCurrentBuffer,
//     refreshFileData,
//     updateBuffer,
//     compile: true,
//     currentBuffer: ensureBuffer(data),
//     filename,
//   };
//   return state;

//   function refreshFileData(data: Buffer) {
//     const sameData = isSameData(data);
//     if (sameData) {
//       return false;
//     }
//     updateBuffer(data);
//     return true;
//   }

//   function isSameData(data: Buffer) {
//     return state.getCurrentBuffer().equals(data);
//   }

//   function getCurrentBuffer() {
//     return state.currentBuffer;
//   }

//   function updateBuffer(newBuffer: Buffer) {
//     state.currentBuffer = ensureBuffer(newBuffer);

//     cache.set(state.filename, {
//       ...state,
//       version: state.version + 1,
//     });
//   }
// };
