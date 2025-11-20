import * as Cause from 'effect/Cause';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import ts from 'ts-morph';
import { TwinRuntimeConfig } from '../config/twin.config';
import type { JSXNode, TwinDslModels } from './TwinDsl.models';

const make = Effect.gen(function* () {
  const { tsConfigPath } = yield* TwinRuntimeConfig;

  const tsConfig = yield* Effect.sync(() => {
    const userConfig = ts.getCompilerOptionsFromTsConfig(tsConfigPath);
    return { ...userConfig.options, noEmit: true };
  }).pipe(Effect.flatMap(SubscriptionRef.make));

  const makeTSProject = () => Effect.map(tsConfig.get, createTSProject);

  const tsProject = yield* makeTSProject();
  const tsFS = tsProject.getFileSystem();

  const createSourceFile = (path: string, text: string) => {
    // let cached = tsProject.getSourceFile(path);
    // if (cached) {
    //   if (cached.getText() !== text) {
    //     cached = cached.replaceWithText(text) as ts.SourceFile;
    //   }
    //   cached.saveSync();
    //   return cached;
    // }
    return tsProject.createSourceFile(path, text, { overwrite: true });
  };

  const getSourceFileByPath = (filePath: string) => {
    return Option.fromNullable(tsProject.getSourceFile(filePath));
  };

  const updateTsConfig = Effect.fn(function* (newPath: string) {
    return yield* SubscriptionRef.updateAndGet(tsConfig, (x) =>
      Object.assign(ts.getCompilerOptionsFromTsConfig(newPath).options, x),
    ).pipe(Effect.andThen((config) => tsProject.compilerOptions.set(config)));
  });

  const subscribeToTsConfig = Effect.fn(function* (
    cb: (config: ts.CompilerOptions) => Effect.Effect<void>,
  ) {
    return yield* Stream.changes(tsConfig.changes).pipe(
      Stream.runForEach((config) => Effect.succeed(cb).pipe(Effect.ap(Effect.succeed(config)))),
      Stream.runDrain,
      Effect.forkDaemon,
    );
  });

  return {
    updateTsConfig,
    createSourceFile,
    makeTSProject,
    tsProject,
    tsFS,
    flattenDeclarators,
    subscribeToTsConfig,
    getSourceFileByPath,
  };

  function flattenDeclarators(declarator: TwinDslModels.NodeJSXDeclarator) {
    const rootPath = `${declarator.filename}-${declarator.identifier}`;
    const mapped = new Map(flattenNode(declarator.jsxElement, [rootPath]));
    return mapped;

    function flattenNode(node: JSXNode, currentPath: string[]): [string, JSXNode][] {
      const nextPath = [...currentPath, `${node.index}`];
      const childs = node.childs.flatMap((x) => flattenNode(x, nextPath));
      return [[nextPath.join('-'), node], ...childs];
    }
  }
}).pipe(Effect.onError((error) => Effect.log('error creating tsconfig', Cause.pretty(error))));

export interface TypescriptApi extends Effect.Effect.Success<typeof make> {}
export const TypescriptApi = Context.GenericTag<TypescriptApi>('TypescriptApi');

export const TypescriptApiLive = Layer.effect(TypescriptApi, make);

const createTSProject = (config: ts.CompilerOptions) =>
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
  });
