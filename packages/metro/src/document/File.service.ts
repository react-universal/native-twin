import * as FS from '@effect/platform/FileSystem';
import * as Effect from 'effect/Effect';
import { MetroTransformerContext } from '../transformer/transformer.service';

export const getFile = Effect.gen(function* () {
  const context = yield* MetroTransformerContext;
  const fs = yield* FS.FileSystem;
  return {
    context,
    fs,
  };
});
