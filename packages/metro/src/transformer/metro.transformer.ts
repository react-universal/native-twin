import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import path from 'node:path';
import { DocumentService, DocumentServiceLive } from '../document/Document.service';
// import { sendUpdate } from '../server/poll-updates-server';
import { StyleSheetService, StyleSheetServiceLive } from '../sheet/StyleSheet.service';
import type { TwinTransformFn } from '../types/transformer.types';
import { TWIN_CACHE_DIR, TWIN_STYLES_FILE, twinHMRString } from '../utils/constants';
import { ensureBuffer } from '../utils/file.utils';
import { setupNativeTwin } from '../utils/load-config';
import { TransformerConfig } from './transformer.config';
import {
  MetroTransformerService,
  MetroTransformerServiceLive,
} from './transformer.service';

const MainLayer = Layer.mergeAll(
  DocumentServiceLive,
  StyleSheetServiceLive,
  MetroTransformerServiceLive,
);

const program = Effect.gen(function* () {
  const context = yield* TransformerConfig;
  const documents = yield* DocumentService;
  const transformer = yield* MetroTransformerService;
  const sheet = yield* StyleSheetService;

  const transformFile = documents
    .getDocument({
      data: context.sourceCode,
      filename: context.filename,
      projectRoot: context.projectRoot,
      type: context.fileType,
      platform: context.platform,
    })
    .pipe(Option.getOrNull);

  if (!transformFile) {
    return transformer.transform(context.sourceCode, true);
  }

  if (transformFile.isCss) {
    let css = sheet.refreshSheet();
    css = `${css}\n${twinHMRString}`;
    return transformer.transform(css, true);
  }

  const twinConfig = transformer.getTwinConfig();
  if (transformer.isNotAllowedPath()) {
    return transformer.transform(context.sourceCode, true);
  }

  if (!transformFile) {
    return transformer.transform(context.sourceCode, true);
  }

  const twin = setupNativeTwin(twinConfig, {
    dev: context.isDev,
    hot: context.isDev,
    platform: context.platform,
  });

  const compiled = yield* Effect.promise(() => transformFile.compileFile(twin.tw));

  if (compiled && compiled.classNames.length > 0) {
    // const registered = sheet.registerEntries(compiled.entries, context.platform);
    // const runtimeStyles = Array.from(compiled.twinComponentStyles.entries());
    // const styledFn = sheet.getComponentFunction(Array.from(runtimeStyles));
    // const code = `${compiled.code}\n`;
    // if (registered) {
    //   sendUpdate(sheet.getSheetDocumentText(), file.version);
    // }
  }

  return transformer.transform(compiled.full, false);
});

const runnable = Effect.provide(program, MainLayer);

export const transform: TwinTransformFn = async (
  config,
  projectRoot,
  filename,
  data,
  options,
) => {
  const cssOutput = path.join(projectRoot, TWIN_CACHE_DIR, TWIN_STYLES_FILE);

  return runnable.pipe(
    Effect.provideService(TransformerConfig, {
      workerArgs: {
        config,
        data,
        filename,
        options,
        projectRoot,
      },
      cssOutput,
      filename,
      fileType: options.type,
      isDev: options.dev,
      platform: options.platform ?? 'ios',
      projectRoot,
      sourceCode: ensureBuffer(data),
    }),
    Effect.runPromise,
  );
};
