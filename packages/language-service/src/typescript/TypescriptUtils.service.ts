import * as path_ from 'node:path';
import * as Config from 'effect/Config';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import ts from 'ts-morph';
import { TSCompilerDefaultOptions } from '../utils/constants.utils';

const make = Effect.gen(function* () {
  const configPath = yield* Config.string('').pipe(
    Config.withDefault(path_.join(process.cwd(), 'tsconfig.json')),
  );
  const tsConfig = yield* Effect.sync(() => {
    const userConfig = ts.getCompilerOptionsFromTsConfig(configPath);
    return { ...userConfig, ...TSCompilerDefaultOptions };
  }).pipe(Effect.flatMap(SubscriptionRef.make));

  const updateTsConfig = Effect.fn(function* (newPath: string) {
    return yield* SubscriptionRef.update(tsConfig, (x) => ({
      ...x,
      ...ts.getCompilerOptionsFromTsConfig(newPath).options,
    }));
  });

  const tsProject = yield* tsConfig.pipe(
    Effect.map(
      (compilerOptions) =>
        new ts.Project({
          tsConfigFilePath: configPath,
          compilerOptions: compilerOptions.options,
          skipAddingFilesFromTsConfig: true,
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
  return { updateTsConfig, tsProject };
});

export interface TypescriptUtils extends Effect.Effect.Success<typeof make> {}
export const TypescriptUtils = Context.GenericTag<TypescriptUtils>('TypescriptUtils');

export const TypescriptUtilsLive = Layer.effect(TypescriptUtils, make);
