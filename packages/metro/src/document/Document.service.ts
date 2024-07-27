import type * as Error from '@effect/platform/Error';
import * as FS from '@effect/platform/FileSystem';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import type * as Option from 'effect/Option';
import type * as Scope from 'effect/Scope';
import type { TwinFileHandlerArgs } from '../metro.types';
import { type TransformFile } from '../models/TransformFile.model';
import { MetroTransformerContext } from '../transformer/transformer.service';
import { ensureBuffer } from '../utils';
import { createTwinDocument, getDocument } from './utils/documents.cache';

interface DocumentServiceShape {
  getDocument(file: TwinFileHandlerArgs): Option.Option<TransformFile>;
  createTwinDocument(file: TwinFileHandlerArgs): Option.Option<TransformFile>;
  getFile: Effect.Effect<FS.File, Error.PlatformError, Scope.Scope>;
}

export class DocumentService extends Context.Tag('files/DocumentService')<
  DocumentService,
  DocumentServiceShape
>() {}

export const DocumentServiceLive = Layer.scoped(
  DocumentService,
  Effect.gen(function* () {
    const fs = yield* FS.FileSystem;
    const metroContext = yield* MetroTransformerContext;

    return {
      getDocument,
      createTwinDocument,
      getFile: Effect.gen(function* () {
        const content = ensureBuffer(metroContext.sourceCode);
        const path = yield* fs.makeTempFileScoped();
        const file = yield* fs.open(path, { flag: 'a+' });

        const newSize = yield* file.write(content);
        yield* Effect.log(`WRITE_SIZE ${newSize}`);
        const text = yield* fs.readFileString(path);
        console.log('FINAL_TEXT: ', text);
        return file;
      }),
    };
  }),
);
