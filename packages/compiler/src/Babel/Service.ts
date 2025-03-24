import traverse from '@babel/traverse';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import * as Chunk from 'effect/Chunk';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import { TwinNodeContextLive } from '../Config';
import { ModuleDependency, TwinBabelModule } from '../Domain/TwinBabelModule';
import { TwinJSXElement } from '../Domain/TwinJSXElement';
import { TwinJSXElementNode } from '../Domain/TwinJSXElementNode';
import { TwinFSContext, TwinFSContextLive, type TwinFile, TwinPath } from '../FileSystem';
import { makeTreeFrom } from '../utils/tree.utils';
import type { AnyNodePath, BabelFileAst, JSXElementFunction, JSXElementPath } from './Models';
import { isFunction } from './Predicates';
import { babelParse, getBabelBindingImportSource, isLocalImport } from './Utils';

const make = Effect.gen(function* () {
  const fs = yield* TwinFSContext;

  return {
    moduleFromFile: (file: TwinFile) => fromTwinFile(file),
    moduleFromFilePath,
  };

  function moduleFromFilePath(path_: TwinPath.FilePath) {
    return fs.getFile(path_).pipe(
      Effect.andThen((file) => fromTwinFile(file)),
      Effect.tapError((error) => Effect.logDebug('ERROR_GETTING_MODULE: ', error._tag)),
    );
  }
});

export interface BabelContext extends Effect.Effect.Success<typeof make> {}
export const BabelContext = Context.GenericTag<BabelContext>('BabelContext');

export const BabelContextLive = Layer.effect(BabelContext, make).pipe(
  Layer.provide(TwinNodeContextLive),
  Layer.provide(TwinFSContextLive),
);

export const fromTwinFile = (file: TwinFile): Effect.Effect<TwinBabelModule> => {
  const ast = babelParse(file.code, file.path);
  const dependencies = getModuleDependencies(ast, file.path);
  return getRootJSXElements(ast).pipe(
    Stream.map((babelPath) => {
      const jsxFunction = getJSXElementFunction(babelPath);
      const meta = jsxFunction.pipe(
        Option.map((x) => getDeclaratorData(x)),
        Option.getOrElse(() => ({ isExported: false, name: '__Unknown' })),
      );
      const tree = makeTreeFrom({
        input: babelPath,
        getChilds: (item) => getJSXElementChilds(item),
        transform: (jsxElement) =>
          jSXElementToTwinNode(jsxElement, { dependencies, file }),
      });
      return new TwinJSXElement(file, jsxFunction, meta, tree);
    }),
    Stream.runCollect,
    Effect.map(RA.fromIterable),
    Effect.map(
      (jsxElements) => new TwinBabelModule({ ast, file, jsxElements, dependencies }),
    ),
  );
};

const jSXElementToTwinNode = (
  path: JSXElementPath,
  options: { dependencies: ModuleDependency[]; file: TwinFile },
) => {
  const ident = path.node.openingElement.name;
  if (!t.isJSXIdentifier(ident)) return null;

  const dependency = Option.fromNullable(path.scope.getBinding(ident.name)).pipe(
    Option.andThen(getBabelBindingImportSource),
    Option.map((importSource) =>
      TwinPath.NodePath.resolve(options.file.dirname, importSource.source),
    ),
    Option.andThen((resolvedPath) =>
      RA.findFirst(options.dependencies, (x) => x.filepath.startsWith(resolvedPath)),
    ),
  );
  return new TwinJSXElementNode(options.file, path, ident.name, dependency);
};

const getJSXElementChilds = (jsxElement: JSXElementPath) =>
  jsxElement.get('children').filter((x) => x.isJSXElement());

const getRootJSXElements = (ast: BabelFileAst) =>
  Stream.async<JSXElementPath>((emit) => {
    traverse(
      ast,
      {
        Program: {
          exit() {
            emit.chunk(Chunk.fromIterable(this.elements)).then(() => emit.end());
          },
        },
        JSXElement(path) {
          this.elements.push(path);
          path.skip();
        },
      },
      undefined,
      {
        elements: [] as JSXElementPath[],
      },
    );
  });

const getModuleDependencies = (ast: BabelFileAst, filename: TwinPath.FilePath) => {
  const dependencies: ModuleDependency[] = [];
  for (const statement of ast.program.body) {
    if (!t.isImportDeclaration(statement)) continue;
    const importPath = statement.source.value;
    const isLocal = isLocalImport(importPath);

    const fullPath = isLocal
      ? TwinPath.AbsolutePath.make(
          TwinPath.NodePath.resolve(TwinPath.NodePath.dirname(filename), importPath),
        )
      : TwinPath.npmModulePathFromString(importPath);

    for (const specifier of statement.specifiers) {
      if (!t.isImportSpecifier(specifier)) continue;
      if (!t.isIdentifier(specifier.imported)) continue;

      dependencies.push(
        new ModuleDependency({
          exportName: specifier.imported.name,
          filepath: fullPath,
          isLocal,
          localName: specifier.local.name,
          originalSource: importPath,
        }),
      );
    }
  }

  return dependencies;
};

const getJSXElementFunction = (
  jsxPath: JSXElementPath,
): Option.Option<JSXElementFunction> => {
  let compFn: AnyNodePath | null = jsxPath.findParent(isFunction);
  while (compFn) {
    const parent = compFn.findParent(isFunction);
    if (parent) {
      compFn = parent;
    } else {
      break;
    }
  }
  if (!compFn) {
    console.error('Cant find the component top most function');
    return Option.none();
  }
  return Option.liftPredicate(compFn, (x) => isFunction(x));
};

const getDeclaratorData = (node: JSXElementFunction): TwinJSXElement['meta'] => {
  let name: TwinJSXElement['meta']['name'] = '__Unknown';
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
