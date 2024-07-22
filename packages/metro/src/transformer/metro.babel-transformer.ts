import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import path from 'path';
import { DocumentService, DocumentServiceLive } from '../document/Document.service';
import { sendUpdate } from '../server/poll-updates-server';
import { StyleSheetService, StyleSheetServiceLive } from '../sheet/StyleSheet.service';
import { TwinTransformerOptions } from '../types/transformer.types';
import { TWIN_CACHE_DIR, TWIN_STYLES_FILE } from '../utils/constants';
import { ensureBuffer } from '../utils/file.utils';
import { setupNativeTwin } from '../utils/load-config';
import { TransformerConfig } from './transformer.config';
import {
  BabelTransformContext,
  BabelTransformService,
  TransformerServiceLive,
} from './transformer.service';

const MainLayer = Layer.mergeAll(
  DocumentServiceLive,
  StyleSheetServiceLive,
  TransformerServiceLive,
);

const program = Effect.gen(function* () {
  const context = yield* BabelTransformContext;
  const documents = yield* DocumentService;
  const transformer = yield* BabelTransformService;
  const sheet = yield* StyleSheetService;

  const transformFile = documents.getDocument({
    data: context.src,
    filename: context.filename,
    projectRoot: context.options.projectRoot,
    type: context.options.type,
    platform: context.options.platform,
  });

  const isCss = Option.map(transformFile, (x) => x.isCss).pipe(
    Option.getOrElse(() => false),
  );
  if (isCss) {
    const css = sheet.refreshSheet();
    return transformer.transformCSS(css);
  }

  const twinConfig = transformer.getTwinConfig();
  if (transformer.isNotAllowedPath()) {
    return transformer.transform(context);
  }

  return Option.flatMap(transformFile, (file) => {
    const twin = setupNativeTwin(twinConfig, {
      dev: context.options.dev,
      hot: context.options.hot,
      platform: context.options.platform,
    });
    const compiled = file.compileFile(twin.tw);
    if (compiled && compiled.compiledClasses.length > 0) {
      const registered = sheet.registerEntries(compiled.compiledClasses);
      let code = compiled.code;
      const runtimeStyles = Array.from(compiled.twinComponentStyles.entries());
      code = `${code}\nvar __twinComponentStyles = ${JSON.stringify(Object.fromEntries(runtimeStyles))}`;

      const styledFn = sheet.getComponentFunction(Array.from(runtimeStyles));

      code = `${code}\n${styledFn}`;
      if (registered) {
        sendUpdate(sheet.getSheetDocumentText(), file.version);
      }

      return Option.some(
        transformer.transform({
          ...context,
          src: code,
        }),
      );
    }

    return Option.none();
  }).pipe(Option.getOrElse(() => transformer.transform(context)));
});

const runnable = Effect.provide(program, MainLayer);

export const transform = async (context: TwinTransformerOptions) => {
  const cssOutput = path.join(
    context.options.projectRoot,
    TWIN_CACHE_DIR,
    TWIN_STYLES_FILE,
  );
  return runnable.pipe(
    Effect.provideService(BabelTransformContext, context),
    Effect.provideService(TransformerConfig, {
      cssOutput,
      filename: context.filename,
      fileType: context.options.type,
      isDev: context.options.dev,
      platform: context.options.platform,
      projectRoot: context.options.projectRoot,
      sourceCode: ensureBuffer(context.src),
    }),
    Effect.runSync,
  );
};
