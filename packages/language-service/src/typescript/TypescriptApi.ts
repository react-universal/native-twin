import * as path_ from 'node:path';
import * as Config from 'effect/Config';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import ts from 'ts-morph';
import { TSCompilerDefaultOptions } from '../utils/constants.utils';

const make = Effect.gen(function* () {
  const configPath = yield* Config.string('config').pipe(
    Config.withDefault(path_.join(process.cwd(), 'tsconfig.json')),
  );
  const tsConfig = yield* Effect.sync(() => {
    const userConfig = ts.getCompilerOptionsFromTsConfig(configPath);
    return { ...userConfig.options, ...TSCompilerDefaultOptions };
  }).pipe(Effect.flatMap(SubscriptionRef.make));

  const tsProject = yield* makeTSProject();
  const fs = tsProject.getFileSystem();

  const createSourceFile = (path: string, text: string) => {
    const cached = tsProject.getSourceFile(path);
    if (cached && cached.getText() === text) return cached;
    return tsProject.createSourceFile(path, text, { overwrite: true });
  };

  const updateTsConfig = Effect.fn(function* (newPath: string) {
    return yield* SubscriptionRef.updateAndGet(tsConfig, (x) =>
      Object.assign(ts.getCompilerOptionsFromTsConfig(newPath).options, x),
    ).pipe(Effect.andThen((config) => tsProject.compilerOptions.set(config)));
  });

  return { updateTsConfig, createSourceFile, makeTSProject, tsProject, fs } as const;

  function makeTSProject() {
    return tsConfig.get.pipe(
      Effect.map(
        (config) =>
          new ts.Project({
            skipFileDependencyResolution: true,
            compilerOptions: config,
            useInMemoryFileSystem: true,
            manipulationSettings: {
              indentationText: ts.IndentationText.TwoSpaces,
              insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
              newLineKind: ts.NewLineKind.LineFeed,
              quoteKind: ts.QuoteKind.Double,
              useTrailingCommas: true,
            },
          }),
      ),
    );
  }
}).pipe(Effect.onError((error) => Effect.log('error creating tsconfig', error)));

export interface TypescriptApi extends Effect.Effect.Success<typeof make> {}
export const TypescriptApi = Context.GenericTag<TypescriptApi>('TypescriptApi');

export const TypescriptApiLive = Layer.effect(TypescriptApi, make);
