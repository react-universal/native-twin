import * as path_ from 'node:path';
import * as Config from 'effect/Config';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Ref from 'effect/Ref';
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

  const tsProject = yield* Ref.make(makeTSProject(configPath));

  const fileSystemRef = tsProject.pipe(Effect.map((project) => Ref.make(project.getFileSystem)));

  const createSourceFile = (path: string, text: string): Effect.Effect<ts.SourceFile> =>
    Ref.get(tsProject).pipe(Effect.map((compiler) => compiler.createSourceFile(path, text)));

  const updateTsConfig = Effect.fn(function* (newPath: string) {
    return yield* SubscriptionRef.updateAndGet(tsConfig, (x) => ({
      ...x,
      ...ts.getCompilerOptionsFromTsConfig(newPath).options,
    })).pipe(
      Effect.zipRight(tsProject.get),
      Effect.flatMap((project) => {
        project.getLanguageService().compilerObject.dispose();
        return Ref.set(tsProject, makeTSProject(newPath));
      }),
    );
  });

  return { updateTsConfig, createSourceFile, makeTSProject, tsProject, fileSystemRef } as const;

  function makeTSProject(tsConfigPath: string) {
    const compilerOptions = ts.getCompilerOptionsFromTsConfig(tsConfigPath);

    const registry = ts.ts.createDocumentRegistry(true);

    registry.getKeyForCompilationSettings(compilerOptions.options);

    return new ts.Project({
      tsConfigFilePath: path_.join(process.cwd(), 'tsconfig.build.json'),
      compilerOptions: compilerOptions.options,
      skipAddingFilesFromTsConfig: true,
      manipulationSettings: {
        indentationText: ts.IndentationText.TwoSpaces,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
        newLineKind: ts.NewLineKind.LineFeed,
        quoteKind: ts.QuoteKind.Double,
        useTrailingCommas: true,
      },
    });
  }
}).pipe(Effect.onError((error) => Effect.log(error)));

export interface TypescriptApi extends Effect.Effect.Success<typeof make> {}
export const TypescriptApi = Context.GenericTag<TypescriptApi>('TypescriptApi');

export const TypescriptApiLive = Layer.effect(TypescriptApi, make);
