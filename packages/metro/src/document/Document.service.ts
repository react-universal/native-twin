import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import type * as Option from 'effect/Option';
import type { TwinFileHandlerArgs } from '../metro.types';
import { createTwinDocument, getDocument } from './models/documents.cache';
import { type TransformFile } from './models/TransformFile.model';

interface DocumentServiceShape {
  getDocument(file: TwinFileHandlerArgs): Option.Option<TransformFile>;
  createTwinDocument(file: TwinFileHandlerArgs): Option.Option<TransformFile>;
}

export class DocumentService extends Context.Tag('files/DocumentService')<
  DocumentService,
  DocumentServiceShape
>() {}

export const DocumentServiceLive = Layer.scoped(
  DocumentService,
  Effect.gen(function* () {
    return {
      getDocument,
      createTwinDocument,
    };
  }),
);
