import { CodeGenerator } from '@babel/generator';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { cx } from '@native-twin/core';
import { parseTWTokens } from '@native-twin/css';
import * as RA from 'effect/Array';
import * as Chunk from 'effect/Chunk';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import { TwinJSXClassnameProp } from '../Domain/JSXStyledProp';
import { ModuleDependency, TwinModuleAst } from '../Domain/TwinAst';
import { TwinJSXElement, TwinJSXElementNode } from '../Domain/TwinJSXElementNode';
import { type TwinFile, TwinFSContext, TwinPath } from '../FileSystem';
import { type MappedComponent, mappedComponents } from '../utils/constants';
import { makeTreeFrom } from '../utils/tree.utils';
import type {
  AnyNodePath,
  BabelFileAst,
  JSXAttributeNode,
  JSXElementFunction,
  JSXElementPath,
} from './Models';
import { isFunction } from './Predicates';
import { babelParse, getBabelBindingImportSource, isLocalImport } from './Utils';

const make = Effect.gen(function* () {
  const fs = yield* TwinFSContext;

  const getTwinModuleAstFromPath = Effect.fn((path_: TwinPath.FilePath) =>
    fs.getFile(path_).pipe(
      Effect.andThen((file) => astFromTwinFile(file)),
      Effect.tapError((error) => Effect.logDebug('ERROR_GETTING_MODULE: ', error._tag)),
    ),
  );

  return {
    getTwinFileAst: (file: TwinFile) => astFromTwinFile(file),
    getTwinModuleAstFromPath,
  };
});

export interface BabelContext extends Effect.Effect.Success<typeof make> {}
export const BabelContext = Context.GenericTag<BabelContext>('BabelContext');

export const BabelContextLive = Layer.effect(BabelContext, make);

const astFromTwinFile = (file: TwinFile): Effect.Effect<TwinModuleAst> => {
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
        transform: (jsxElement) => {
          return jSXElementToTwinNode(jsxElement, {
            dependencies,
            file,
          });
        },
      });
      return new TwinJSXElement(file, jsxFunction, meta, tree);
    }),
    Stream.runCollect,
    Effect.map(RA.fromIterable),
    Effect.map((jsxElements) => new TwinModuleAst({ ast, file, jsxElements, dependencies })),
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
  const mappedProps = RA.findFirst(mappedComponents, (x) => x.name === ident.name).pipe(
    Option.getOrElse(
      (): MappedComponent => ({
        name: ident.name,
        config: {
          className: 'style'
        },
        kind: 'unknown',
      }),
    ),
  );
  const classNameProps = getClassNamePropsFromJSX(path, mappedProps);
  return new TwinJSXElementNode({
    file: options.file,
    dependency,
    babelPath: path,
    name: ident.name,
    classNameProps,
    mappedProps,
  });
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

// TODO: delete me
const getJSXElementFunction = (jsxPath: JSXElementPath): Option.Option<JSXElementFunction> => {
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
      isExported = fnParent.isExportDeclaration() || fnParent.isExportDefaultDeclaration();
      const upperParent = fnParent.parentPath;
      if (!isExported && upperParent) {
        isExported = upperParent.isExportDeclaration() || upperParent.isExportDefaultDeclaration();
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

const getClassNamePropsFromJSX = (jsxElement: JSXElementPath, mappedConfig: MappedComponent) => {
  const classNameProps: TwinJSXClassnameProp[] = [];
  const jsxAttributes = jsxElement
    .get('openingElement')
    .get('attributes')
    .filter((x) => x.isJSXAttribute());

  const validClassNames = Object.entries(mappedConfig.config);
  for (const attribute of jsxAttributes) {
    const namePath = attribute.get('name');
    if (!namePath.isJSXIdentifier()) continue;

    const className = validClassNames.find((x) => attribute.node.name.name === x[0]);
    if (!className) continue;

    const [prop, target] = className;
    const ast = getJSXAttributeValue(attribute.node);
    if (!ast) continue;

    const value = getPropValueString(ast);
    classNameProps.push(
      new TwinJSXClassnameProp({
        prop,
        target,
        ast: attribute,
        expression: value.templateExpression,
        text: value.text,
        twinRules: value.twinRules,
      }),
    );
  }

  return classNameProps;
};

/**
 * @domain Babel
 * @description Extract the {@link TwinJSXClassnameProp} from any {@link t.JSXAttribute}
 * */
const getJSXAttributeValue = (attribute: JSXAttributeNode) => {
  if (!t.isJSXIdentifier(attribute.name)) return null;

  let ast: t.TemplateLiteral | t.StringLiteral | undefined;

  if (t.isStringLiteral(attribute.value)) {
    ast = attribute.value;
  }

  if (t.isJSXExpressionContainer(attribute.value)) {
    if (t.isTemplateLiteral(attribute.value.expression)) {
      ast = attribute.value.expression;
    }
    if (t.isCallExpression(attribute.value.expression)) {
      ast = t.templateLiteral(
        [t.templateElement({ raw: '', cooked: '' }), t.templateElement({ raw: '', cooked: '' })],
        [attribute.value.expression],
      );
    }
  }
  if (!ast) return null;

  return ast;
};

const getPropValueString = (node: t.StringLiteral | t.TemplateLiteral) => {
  if (t.isStringLiteral(node)) {
    const text = cx`${node.value}`;
    return {
      text,
      twinRules: parseTWTokens(text),
      templateExpression: Option.none<string>(),
    };
  }
  const cooked = templateLiteralToStringLike(node);

  const text = cx`${cooked.strings}`;
  return {
    text,
    twinRules: parseTWTokens(text),
    templateExpression: Option.liftPredicate(node.expressions, (x) => x.length > 0).pipe(
      Option.map((_) => new CodeGenerator(cooked.expressions).generate().code),
    ),
  };
};

const templateLiteralToStringLike = (literal: t.TemplateLiteral) => {
  const strings = literal.quasis
    .map((x) => (x.value.cooked ? x.value.cooked : x.value.raw))
    .map((x) => x.trim().replace(/\n/g, '').trim().replace(/\s+/g, ' '))
    .filter((x) => x.length > 0)
    .join('');
  const expressions = t.templateLiteral(
    literal.quasis.map(() => t.templateElement({ raw: '', cooked: '' })),
    literal.expressions,
  );
  return { strings, expressions: expressions };
};
