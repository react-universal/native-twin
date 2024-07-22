import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import { DocumentService, DocumentServiceLive } from '../document/Document.service';
import { sendUpdate } from '../server/poll-updates-server';
import { StyleSheetService, StyleSheetServiceLive } from '../sheet/StyleSheet.service';
import { TwinTransformerOptions } from '../types/transformer.types';
import { setupNativeTwin } from '../utils/load-config';
import { FileServiceLive } from './files/file.service';
import {
  MetroTransformContext,
  TransformerService,
  TransformerServiceLive,
} from './transformer.service';

const MainLayer = Layer.mergeAll(
  FileServiceLive,
  DocumentServiceLive,
  StyleSheetServiceLive,
  TransformerServiceLive,
);

const program = Effect.gen(function* () {
  const context = yield* MetroTransformContext;
  const documents = yield* DocumentService;
  const transformer = yield* TransformerService;
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
    const css = sheet.refreshSheet(context.options.dev);
    return transformer.transform({
      ...context,
      src: css,
    });
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
  return runnable.pipe(
    Effect.provideService(MetroTransformContext, context),
    Effect.runSync,
  );
};
