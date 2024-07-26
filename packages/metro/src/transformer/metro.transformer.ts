import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import path from 'node:path';
import { DocumentService, DocumentServiceLive } from '../document/Document.service';
import { sendUpdate } from '../server/poll-updates-server';
import { BabelSheetEntry } from '../sheet/Sheet.model';
import { StyleSheetService, StyleSheetServiceLive } from '../sheet/StyleSheet.service';
import { TWIN_CACHE_DIR, TWIN_STYLES_FILE, twinHMRString } from '../utils/constants';
import { ensureBuffer } from '../utils/file.utils';
import { setupNativeTwin } from '../utils/load-config';
import { splitClasses } from '../utils/twin.utils';
import {
  MetroTransformerService,
  MetroTransformerContext,
  MetroTransformerServiceLive,
} from './transformer.service';
import type { TwinTransformFn } from './transformer.types';

const MainLayer = Layer.mergeAll(
  DocumentServiceLive,
  StyleSheetServiceLive,
  MetroTransformerServiceLive,
);

const program = Effect.gen(function* () {
  const context = yield* MetroTransformerContext;
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

  const classNames = pipe(
    compiled.components,
    RA.map((x) => {
      return {
        ...x,
        entries: x.getComponentEntries(twin.tw),
        componentClasses: RA.flatMap(x.mappedAttributes, (x) =>
          splitClasses(x.value.literal),
        ),
      };
    }),
  );

  const babelEntries = pipe(
    classNames,
    RA.flatMap((x) => x.entries.flatMap((x) => x.entries)),
    RA.map((x) => new BabelSheetEntry(x)),
  );

  if (compiled && classNames.length > 0) {
    const registered = sheet.registerEntries(babelEntries, context.platform);

    // const styledFn = sheet.getComponentFunction(runtimeStyles);
    // compiled.full = `${compiled.full}\n${styledFn}`;
    // compiled.full = `${compiled.full}\nvar __twinComponentStyles = ${JSON.stringify(Object.fromEntries(runtimeStyles))}`;
    if (registered) {
      transformFile.version = transformFile.version + 1;
      sendUpdate(
        sheet.getSheetDocumentText(transformFile.version),
        transformFile.version + 1,
      );
    }
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
    Effect.provideService(MetroTransformerContext, {
      config,
      filename,
      options,
      projectRoot,
      cssOutput,
      fileType: options.type,
      isDev: options.dev,
      platform: options.platform ?? 'ios',
      sourceCode: ensureBuffer(data),
    }),
    Effect.runPromise,
  );
};
