import traverse, { type NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as Chunk from 'effect/Chunk';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import * as TwinPath from '../FileSystem/Path.model';
import {
  type AnyNodePath,
  type BabelFileAst,
  BabelModule,
  JSXElementDeclaration,
  type JSXElementFunction,
  type JSXElementPath,
  ModuleDependency,
} from './Models';
import { babelParse } from './Parser';
import { isLocalImport } from './Utils';

export const makeBabelModule = (filename: TwinPath.FilePath, code: string) => {
  const ast = babelParse(code, filename);

  const dependencies = getModuleDependencies(ast, filename);
  const rootElements = getRootJSXElements(ast);
  const definitions = rootElements.pipe(mapJSXElementsToDeclarator);
  return new BabelModule(filename, code, ast, dependencies, rootElements, definitions);
};

const getModuleDependencies = (ast: BabelFileAst, filename: TwinPath.FilePath) => {
  const dependencies: ModuleDependency[] = [];
  for (const statement of ast.program.body) {
    if (!t.isImportDeclaration(statement)) continue;
    const importPath = statement.source.value;
    const isLocal = isLocalImport(importPath);
    const fullPath = TwinPath.absolutePathFromString(
      isLocal
        ? importPath
        : TwinPath.NodePath.resolve(TwinPath.NodePath.dirname(filename), importPath),
    );
    for (const specifier of statement.specifiers) {
      if (!t.isImportSpecifier(specifier)) continue;
      if (!t.isIdentifier(specifier.imported)) continue;

      dependencies.push(
        ModuleDependency.make({
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

const mapJSXElementsToDeclarator = (stream: Stream.Stream<JSXElementPath>) =>
  Stream.filterMap(stream, (babelPath) => {
    const def = funcJSXElementFunction(babelPath);
    if (!def) return Option.none();
    const declarator = getDeclaratorData(def);
    return Option.some(
      new JSXElementDeclaration(declarator.name, declarator.isExported, def, babelPath),
    );
  });

const funcJSXElementFunction = (jsxPath: JSXElementPath): JSXElementFunction | null => {
  const isFunction = (path: NodePath<any>) =>
    path.isArrowFunctionExpression() ||
    path.isFunctionDeclaration() ||
    path.isFunctionExpression();

  let compFn: NodePath<any> | null = jsxPath.findParent(isFunction);
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
    return null;
  }
  return compFn;
};

export const getDeclaratorData = (node: AnyNodePath) => {
  let name = 'Unknown';
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
