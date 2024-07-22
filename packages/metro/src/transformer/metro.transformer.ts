import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import worker from 'metro-transform-worker';
import path from 'node:path';
import { DocumentService, DocumentServiceLive } from '../document/Document.service';
import { sendUpdate } from '../server/poll-updates-server';
import { StyleSheetService, StyleSheetServiceLive } from '../sheet/StyleSheet.service';
import { TwinTransformFn } from '../types/transformer.types';
import { TWIN_CACHE_DIR, TWIN_STYLES_FILE } from '../utils/constants';
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

  const transformFile = documents.getDocument({
    data: context.sourceCode,
    filename: context.filename,
    projectRoot: context.projectRoot,
    type: context.fileType,
    platform: context.platform,
  });

  const isCss = Option.map(transformFile, (x) => x.isCss).pipe(
    Option.getOrElse(() => false),
  );
  if (isCss) {
    const css = sheet.refreshSheet();
    return Option.some(ensureBuffer(css));
  }

  const twinConfig = transformer.getTwinConfig();
  if (transformer.isNotAllowedPath()) {
    return Option.none();
  }

  return Option.flatMap(transformFile, (file) => {
    const twin = setupNativeTwin(twinConfig, {
      dev: context.isDev,
      hot: context.isDev,
      platform: context.platform,
    });
    const compiled = file.compileFile(twin.tw);
    if (compiled && compiled.compiledClasses.length > 0) {
      const registered = sheet.registerEntries(compiled.compiledClasses);
      const runtimeStyles = Array.from(compiled.twinComponentStyles.entries());
      const styledFn = sheet.getComponentFunction(Array.from(runtimeStyles));

      const code = `${compiled.code}\n${file.getTwinComponentStyles(runtimeStyles)}\n${styledFn}`;

      if (registered) {
        sendUpdate(sheet.getSheetDocumentText(), file.version);
      }

      return Option.some(ensureBuffer(code));
    }

    return Option.none();
  });
});

const runnable = Effect.provide(program, MainLayer);

export const transform: TwinTransformFn = (
  config,
  projectRoot,
  filename,
  data,
  options,
) => {
  const cssOutput = path.join(projectRoot, TWIN_CACHE_DIR, TWIN_STYLES_FILE);
  const transformer: TwinTransformFn = config.transformerPath
    ? require(config.transformerPath).transform
    : worker.transform;

  return runnable
    .pipe(
      Effect.provideService(TransformerConfig, {
        cssOutput,
        filename,
        fileType: options.type,
        isDev: options.dev,
        platform: options.platform ?? 'ios',
        projectRoot,
        sourceCode: ensureBuffer(data),
      }),
      Effect.runSync,
    )
    .pipe(
      Option.match({
        onNone: () =>
          transformer(config, projectRoot, filename, ensureBuffer(data), options),
        onSome: (data) => worker.transform(config, projectRoot, filename, data, options),
      }),
    );
};
