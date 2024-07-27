import * as FS from '@effect/platform/FileSystem';
import * as Effect from 'effect/Effect';
import { MetroTransformerContext } from '../transformer/transformer.service';

export const getFile = Effect.gen(function* () {
  yield* MetroTransformerContext;
  const fs = yield* FS.FileSystem;
  const path = yield* fs.makeTempFileScoped();
  
  return {
    readFile: Effect.gen(function* () {
      const file = yield* fs.open(path, { flag: 'a+' });

      const newSize = yield* file.write(new TextEncoder().encode('foo'));
      yield* Effect.log(`WRITE_SIZE ${newSize}`);
      yield* file.seek(FS.Size(0), 'start');
      yield* file.write(new TextEncoder().encode('asdasdas'));
      const text = yield* fs.readFileString(path);
      console.log('FINAL_TEXT: ', text);
    }),
  };
});
