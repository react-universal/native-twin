import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import ts from 'ts-morph';
import { TwinRuntimeConfig } from '../config/twin.config';
import { TSCompilerDefaultOptions } from '../utils/constants.utils';
import type { JSXNode, TwinDslModels } from './TwinDsl.models';
import { TypescriptUtils, TypescriptUtilsLive } from './TypescriptUtils.service';

const make = Effect.gen(function* () {
  const { tsConfigPath } = yield* TwinRuntimeConfig;
  const tsUtils = yield* TypescriptUtils;

  const tsConfig = yield* Effect.sync(() => {
    const userConfig = ts.getCompilerOptionsFromTsConfig(tsConfigPath);
    return { ...userConfig.options, ...TSCompilerDefaultOptions };
  }).pipe(Effect.flatMap(SubscriptionRef.make));

  const makeTSProject = () => Effect.map(tsConfig.get, createTSProject);

  const tsProject = yield* makeTSProject();
  const tsFS = tsProject.getFileSystem();

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

  return {
    updateTsConfig,
    createSourceFile,
    makeTSProject,
    tsProject,
    tsFS,
    parseSourceFile,
    flattenDeclarators,
  };

  function parseSourceFile(sourceFile: ts.SourceFile) {
    return Stream.fromIterable(sourceFile.getStatements()).pipe(
      Stream.filterMap((_) => Option.fromNullable(tsUtils.getJSXElementStatement(_))),
      Stream.mapEffect(({ jsxElement, declarator }) =>
        Effect.zip(Effect.succeed(declarator), tsUtils.getTwinJSXNode(jsxElement)),
      ),
      Stream.map(([...args]) => makeNodeJSXDeclarator(...args)),
      Stream.runCollect,
      Effect.map(
        (declarations): TwinDslModels.TwinSourceFile => ({
          _tag: 'TwinSourceFile',
          jsxDeclarators: RA.fromIterable(declarations),
          node: sourceFile,
        }),
      ),
    );
  }

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
}).pipe(Effect.onError((error) => Effect.log('error creating tsconfig', error)));

export interface TypescriptApi extends Effect.Effect.Success<typeof make> {}
export const TypescriptApi = Context.GenericTag<TypescriptApi>('TypescriptApi');

export const TypescriptApiLive = Layer.effect(TypescriptApi, make);

const makeNodeJSXDeclarator = (
  declarator: ts.BindingName,
  jsxElement: JSXNode,
): TwinDslModels.NodeJSXDeclarator => ({
  _tag: 'NodeJSXDeclarator',
  binding: declarator,
  filename: jsxElement.node.getSourceFile().getFilePath(),
  identifier: declarator.getText(),
  jsxElement,
  node: declarator,
});
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
