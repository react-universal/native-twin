import { Effect, Layer } from 'effect';
import * as Context from 'effect/Context';
import fs from 'node:fs';
import { createCacheDir } from '../utils';

export class MetroConfigService extends Context.Tag('config/metro')<
  MetroConfigService,
  {
    resetCache(outputDir: string, filePath: string): void;
  }
>() {
  static Live = Layer.scoped(
    MetroConfigService,
    Effect.gen(function* () {
      return {
        resetCache(outputDir: string, filePath: string) {
          createCacheDir(outputDir);
          fs.writeFileSync(filePath, '');
        },
      };
    }),
  );
}
