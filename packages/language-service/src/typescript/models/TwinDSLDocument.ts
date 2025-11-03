import * as Effect from 'effect/Effect';
import type { SourceFile } from 'ts-morph';
import { TypescriptApi } from '../TypescriptApi';
import { TypescriptUtils } from '../TypescriptUtils.service';

export const make = Effect.gen(function* () {
  const tsAPI = yield* TypescriptApi;
  const tsUtils = yield* TypescriptUtils;
  const files = new Map<number, SourceFile>();

  const createFile = (path: string, content: string | null = null) => {
    const source = tsAPI.createSourceFile(path, content ?? '');

    return source;
  };

  return {};
});
