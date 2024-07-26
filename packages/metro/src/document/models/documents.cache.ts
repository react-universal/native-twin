import * as Equal from 'effect/Equal';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as HM from 'effect/MutableHashMap';
import * as Option from 'effect/Option';
import type { TwinFileHandlerArgs } from '../../metro.types';
import { ensureBuffer } from '../../utils';
import { TransformFile } from './TransformFile.model';

const cache = HM.empty<DocumentCacheKey, TransformFile>();

export class DocumentCacheKey implements Equal.Equal {
  constructor(readonly n: string) {}

  [Hash.symbol](): number {
    return Hash.hash(this.n);
  }

  [Equal.symbol](u: unknown): boolean {
    return u instanceof DocumentCacheKey && this.n === u.n;
  }
}

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
