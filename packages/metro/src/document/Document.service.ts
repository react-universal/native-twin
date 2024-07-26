import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as HM from 'effect/MutableHashMap';
import * as Option from 'effect/Option';
import type { TwinFileHandlerArgs } from '../metro.types';
import { ensureBuffer } from '../utils/file.utils';
import type { DocumentCacheKey } from './documents.cache';
import { getDocumentCacheKey } from './documents.cache';
import { TransformFile } from './models/TransformFile.model';

interface DocumentServiceShape {
  getDocument(file: TwinFileHandlerArgs): Option.Option<TransformFile>;
  createTwinDocument(file: TwinFileHandlerArgs): Option.Option<TransformFile>;
}

export class DocumentService extends Context.Tag('files/DocumentService')<
  DocumentService,
  DocumentServiceShape
>() {}

const cache = HM.empty<DocumentCacheKey, TransformFile>();

export const DocumentServiceLive = Layer.scoped(
  DocumentService,
  Effect.gen(function* () {
    const createTwinDocument = (file: TwinFileHandlerArgs, version = 0) => {
      pipe(
        cache,
        HM.set(getDocumentCacheKey(file.filename), new TransformFile(file, version)),
      );
      return pipe(cache, HM.get(getDocumentCacheKey(file.filename)));
    };

    const getDocument = (file: TwinFileHandlerArgs) => {
      return cache.pipe(
        HM.get(getDocumentCacheKey(file.filename)),
        Option.match({
          onSome: (x) => {
            if (!x.isEqual(ensureBuffer(file.data))) {
              pipe(cache, HM.remove(getDocumentCacheKey(file.filename)));
              return createTwinDocument(file, x.version + 1);
            }
            return Option.some(x);
          },
          onNone: () => createTwinDocument(file),
        }),
      );
    };

    return {
      getDocument,
      createTwinDocument,
    };
  }),
);
