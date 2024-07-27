import { pipe } from 'effect/Function';
import * as HM from 'effect/MutableHashMap';
import * as Option from 'effect/Option';
import type { TwinFileHandlerArgs } from '../../metro.types';
import { DocumentCacheKey, TransformFile } from '../../models/TransformFile.model';
import { ensureBuffer } from '../../utils';

const cache = HM.empty<DocumentCacheKey, TransformFile>();

export function getDocumentCacheKey(s: string): DocumentCacheKey {
  return new DocumentCacheKey(s);
}

export const createTwinDocument = (file: TwinFileHandlerArgs, version = 0) => {
  pipe(
    cache,
    HM.set(getDocumentCacheKey(file.filename), new TransformFile(file, version)),
  );
  return pipe(cache, HM.get(getDocumentCacheKey(file.filename)));
};

export const getDocument = (file: TwinFileHandlerArgs) => {
  return cache.pipe(
    HM.get(getDocumentCacheKey(file.filename)),
    Option.match({
      onSome: (x) => refreshDocument(x, file),
      onNone: () => createTwinDocument(file),
    }),
  );
};

export const removeTwinDocument = (filename: string) => {
  pipe(cache, HM.remove(getDocumentCacheKey(filename)));
};

const refreshDocument = (cachedDocument: TransformFile, file: TwinFileHandlerArgs) => {
  if (!cachedDocument.isEqual(ensureBuffer(file.data))) {
    cachedDocument.refreshDocument(file);
    return Option.some(cachedDocument);
  }
  return Option.some(cachedDocument);
};
