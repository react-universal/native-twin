import * as NodeFileSystem from '@effect/platform-node-shared/NodeFileSystem';
import { Logger, LogLevel, Supervisor } from 'effect';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import path from 'node:path';
import { Project } from 'ts-morph';
import { TwinCompilerServiceLive } from '../compiler/models/compiler.model';
import * as Compiler from '../compiler/ts.compiler';
import { sendUpdate } from '../config/server/poll-updates-server';
import { DocumentService, DocumentServiceLive } from '../document/Document.service';
import { StyleSheetService, StyleSheetServiceLive } from '../sheet/StyleSheet.service';
import { splitClasses, setupNativeTwin, ensureBuffer, getTwinConfig } from '../utils';
import { TWIN_CACHE_DIR, TWIN_STYLES_FILE } from '../utils/constants';
import {
  MetroTransformerService,
  MetroTransformerContext,
  MetroTransformerServiceLive,
} from './transformer.service';
import type { TwinTransformFn } from './transformer.types';

const MainLayer = Layer.mergeAll(
  Layer.merge(DocumentServiceLive, StyleSheetServiceLive).pipe(
    Layer.provide(NodeFileSystem.layer),
  ),
  MetroTransformerServiceLive,
  TwinCompilerServiceLive,
);

const program = Effect.gen(function* () {
  const context = yield* MetroTransformerContext;
  const documents = yield* DocumentService;
  const transformer = yield* MetroTransformerService;
  const sheet = yield* StyleSheetService;
  yield* Supervisor.track;

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
    const css = sheet.refreshSheet();
    // css = `${css}\n${twinHMRString}`;
    return transformer.transform(css, true);
  }

  if (transformer.isNotAllowedPath()) {
    return transformer.transform(context.sourceCode, true);
  }

  if (!transformFile) {
    return transformer.transform(context.sourceCode, true);
  }

  const compiled = yield* Compiler.compileFile;

  const classNames = pipe(
    compiled.elements,
    HashSet.map((x) => {
      return {
        ...x,
        entries: x.rawEntries,
        componentClasses: RA.flatMap(x.node.runtimeData, (x) =>
          splitClasses(x.value.literal),
        ),
      };
    }),
  );

  const babelEntries = pipe(
    classNames,
    RA.fromIterable,
    RA.flatMap((x) => x.rawEntries),
  );

  if (compiled && HashSet.size(classNames) > 0) {
    const registered = sheet.registerEntries(babelEntries, context.platform);
    if (registered) {
      transformFile.version = transformFile.version + 1;
      sendUpdate(
        sheet.getSheetDocumentText(transformFile.version),
        transformFile.version,
      );
    }
  }

  return transformer.transform(compiled.full, false);
});

const runnable = program.pipe(
  Logger.withMinimumLogLevel(LogLevel.All),
  Effect.provide(Logger.pretty),
  Effect.provide(MainLayer),
);

const tsCompiler = new Project({
  useInMemoryFileSystem: true,
});

export const transform: TwinTransformFn = async (
  config,
  projectRoot,
  filename,
  data,
  options,
) => {
  const cssOutput = path.join(projectRoot, TWIN_CACHE_DIR, TWIN_STYLES_FILE);
  const platform = options.platform ?? 'ios';
  const twinConfig = getTwinConfig(projectRoot);
  const twin = setupNativeTwin(twinConfig.twinConfig, {
    dev: options.dev,
    hot: options.dev,
    platform,
  });

  return runnable.pipe(
    Effect.provideService(MetroTransformerContext, {
      tsCompiler,
      config,
      filename,
      options,
      projectRoot,
      cssOutput,
      fileType: options.type,
      isDev: options.dev,
      platform,
      sourceCode: ensureBuffer(data),
      twin: twin.tw,
      twinConfig: twinConfig.twinConfig,
      allowedPaths: twinConfig.allowedPaths,
    }),
    Effect.scoped,
    Effect.runPromise,
  );
};
