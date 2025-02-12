import type { ParseResult } from '@babel/parser';
import type { NodePath } from '@babel/traverse';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { Tree, type TreeNode } from '@native-twin/helpers/tree';
import * as RA from 'effect/Array';
import * as Chunk from 'effect/Chunk';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { identity, pipe } from 'effect/Function';
import * as HashMap from 'effect/HashMap';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Ref from 'effect/Ref';
import * as Stream from 'effect/Stream';
import { FSUtils, TwinPath } from '../internal/fs';
import {
  type ComponentDeclarator,
  type ComponentRef,
  type ImportKind,
  type InputFile,
  type LoadedComponent,
  ResolvedModule,
  ResolverInput,
} from '../models/TwinResolver.models';
import { mappedComponents } from '../shared/compiler.constants';
import { babelParse } from '../utils/babel/babel.parser';
import {
  funcJSXElementFunction,
  getBabelBindingImportSource,
} from '../utils/babel/babel.utils';
import { BabelCompilerContext, BabelCompilerContextLive } from './BabelCompiler.service';
import { TwinNodeContext, TwinNodeContextLive } from './TwinNodeContext.service';

const isLocalImport = (path: string) => path.startsWith('.') || path.startsWith('/');

const make = Effect.gen(function* () {
  const ctx = yield* TwinNodeContext;
  const path = yield* TwinPath.TwinPath;
  const fs = yield* FSUtils.FsUtils;
  yield* BabelCompilerContext;
  const cachedFiles = yield* Ref.make(HashMap.empty<ResolverInput, ResolvedModule>());

  const getCachedFile = (input: ResolverInput) =>
    Ref.get(cachedFiles).pipe(Effect.map((cache) => HashMap.get(cache, input)));

  const setCachedFile = (input: ResolverInput, resolved: ResolvedModule) =>
    Ref.update(cachedFiles, (cache) => HashMap.set(cache, input, resolved));

  const loadFile = (input: InputFile) =>
    Effect.gen(function* () {
      const file = yield* resolveInputFile(input);
      const cached = yield* getCachedFile(file);
      if (Option.isSome(cached)) cached.value;

      const ast = babelParse(file.content, file.filename);
      const roots = yield* getRootElements(ast).pipe(
        Stream.runCollect,
        Effect.map((x) => RA.fromIterable(x).map((decl) => [decl.name, decl] as const)),
      );
      const refs = pipe(
        RA.fromIterable(roots.values()),
        RA.flatMap(([name, component]) =>
          pipe(
            RA.fromIterable(component.tree.all()),
            RA.filterMap((node) => node.value.ref),
            RA.map((ref) => [name, ref] as const),
          ),
        ),
        (reg) => new Map(reg),
      );

      const module = new ResolvedModule({
        components: new Map(roots),
        content: file.content,
        filename: file.filename,
        refs,
      });

      yield* setCachedFile(file, module);
      return module;
    });

  return {
    cachedFiles,
    getBindingsForScope,
    resolveInputFile,
    loadFile,
  };

  function resolveInputFile(input: InputFile) {
    const filename = path.make.absoluteFromString(input.filename);
    if (input.content) return Effect.succeed(new ResolverInput(filename, input.content));
    return Effect.andThen(fs.readFile(filename), (content) =>
      Effect.succeed(new ResolverInput(filename, content)),
    );
  }

  function getBindingsForScope(scope: NodePath<t.JSXElement>['scope'], filename: string) {
    const program = scope.getProgramParent().block as t.Program;

    return resolveDependencies(program, filename);
  }

  function resolveDependencies(program: t.Program, filename: string) {
    return Stream.fromIterable(program.body).pipe(
      Stream.filterMap(Option.liftPredicate((node) => t.isImportDeclaration(node))),
      Stream.filter((node) => isLocalImport(node.source.value)),
      Stream.map((node) => resolveImportPath(filename, node.source.value)),
      Stream.mapEffect((depPath) => fs.findFileExtension(depPath)),
      Stream.tap((x) => Effect.logDebug('dep_path', Option.getOrNull(x))),
      Stream.filterMap(identity),
      Stream.filterEffect((depPath) => ctx.isAllowedPath(depPath)),
      Stream.runCollect,
      Effect.map(RA.fromIterable),
    );
  }

  function resolveImportPath(sourcePath: string, targetPath: string) {
    const sourceDir = path.dirname(sourcePath);
    if (isLocalImport(targetPath)) {
      if (path.extname(targetPath) === '') {
        targetPath += '';
      }
      return path.resolve(sourceDir, targetPath);
    }

    return targetPath;
  }
});

export interface TwinResolverContext extends Effect.Effect.Success<typeof make> {}
export const TwinResolverContext =
  Context.GenericTag<TwinResolverContext>('TwinResolverContext');

export const TwinResolverContextLive = Layer.effect(TwinResolverContext, make).pipe(
  Layer.provide(FSUtils.FsUtilsLive),
  Layer.provide(TwinPath.TwinPathLive),
  Layer.provide(TwinNodeContextLive),
  Layer.provide(BabelCompilerContextLive),
);

const getComponentRef = (
  babelPath: NodePath<t.JSXElement>,
): Option.Option<ComponentRef> =>
  Option.Do.pipe(
    Option.bind('elementName', () =>
      Option.liftPredicate(babelPath.node.openingElement.name, (x) =>
        t.isJSXIdentifier(x),
      ),
    ),
    Option.bind('binding', ({ elementName }) =>
      Option.fromNullable(babelPath.scope.getBinding(elementName.name)),
    ),
    Option.bind('origin', ({ binding }) => getBabelBindingImportSource(binding)),
    Option.bind('mapped', ({ elementName }) =>
      RA.findFirst(mappedComponents, (x) => x.name === elementName.name),
    ),
    Option.map(
      ({ elementName, mapped, origin }): ComponentRef => ({
        elementName,
        mapped,
        importKind: origin.kind as any as ImportKind,
        importSource: origin.source,
      }),
    ),
  );

const getRootElements = (ast: ParseResult<t.File>) =>
  Stream.async<ComponentDeclarator>((emit) => {
    traverse(
      ast,
      {
        Program: {
          exit() {
            emit.chunk(Chunk.fromIterable(this.declarators)).then(() => emit.end());
          },
        },
        JSXElement(path) {
          const declarator = Option.fromNullable(funcJSXElementFunction(path)).pipe(
            Option.map((x) => ({ path: x, ...resolveDeclarator(x) })),
            Option.getOrNull,
          );
          if (!declarator || !declarator.name) return path.skip();

          this.declarators.push({
            tree: getJSXTree(path),
            declarator: declarator.path,
            isExported: declarator.isExported,
            name: declarator.name,
          });
          path.skip();
        },
      },
      undefined,
      {
        declarators: [] as ComponentDeclarator[],
      },
    );
  });

const resolveDeclarator = (node: NodePath<t.Node>) => {
  let name: string | null = null;
  let isExported = false;
  if (node.isArrowFunctionExpression()) {
    const parent = node.parentPath;
    if (parent.isVariableDeclarator()) {
      const ident = parent.node.id;
      if (t.isIdentifier(ident)) {
        name = ident.name;
      }

      const fnParent = parent.parentPath;
      isExported =
        fnParent.isExportDeclaration() || fnParent.isExportDefaultDeclaration();
      const upperParent = fnParent.parentPath;
      if (!isExported && upperParent) {
        isExported =
          upperParent.isExportDeclaration() || upperParent.isExportDefaultDeclaration();
      }
    }
    return { name, isExported };
  }

  if (node.isFunctionDeclaration() && node.node.id) {
    const fnParent = node.parentPath;
    isExported = fnParent.isExportDeclaration() || fnParent.isExportDefaultDeclaration();
    return { name: node.node.id.name, isExported };
  }

  return { name, isExported };
};

const getJSXTree = (element: NodePath<t.JSXElement>) => {
  const tree = new Tree<LoadedComponent>({
    babelPath: element,
    ref: getComponentRef(element),
  });
  getJSXElementChilds(tree.root);

  return tree;
  function getJSXElementChilds(parent: TreeNode<LoadedComponent>) {
    for (const child of parent.value.babelPath
      .get('children')
      .filter((x) => x.isJSXElement())) {
      const childLeave = parent.addChild(
        {
          babelPath: child,
          ref: getComponentRef(child),
        },
        parent,
      );
      getJSXElementChilds(childLeave);
    }
  }
};
