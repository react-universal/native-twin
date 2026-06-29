import { CodeGenerator } from '@babel/generator';
import * as _babelParser from '@babel/parser';
import traverse, { type NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { cx, type MappedComponent, mappedComponents } from '@native-twin/core';
import { parseTWTokens } from '@native-twin/css';
import type { TwinRuntimeComponent } from '@native-twin/css/jsx';
import { asArray } from '@native-twin/helpers';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import { literalValueToAst } from '../utils/babel/babel.utils';
import { makeTreeFrom } from '../utils/tree.utils';
import * as _babelModels from './babel/babel.models';
import * as _babelUtils from './babel/babel.utils';
import type { TwinFile } from './fs';
import * as TwinPath from './path';

export class BabelUtils extends Effect.Service<BabelUtils>()('BabelUtils', {
  accessors: true,
  effect: Effect.gen(function* () {
    const getAstFileID = (node: _babelModels.BabelFileAst | t.File) => {
      const loc = _babelUtils.getSourceLocation(node);
      return `${TwinPath.NodePath.dirname(loc.filename)}:${Hash.string(TwinPath.filePathFromString(loc.filename))}`;
    };

    const getAstFileDeps = (file: _babelModels.BabelFileAst) =>
      getModuleDependencies(
        file,
        TwinPath.filePathFromString(_babelUtils.getSourceLocation(file).filename),
      );

    const parseFile = (filepath: string, code: string) => babelParse(code, filepath);

    return {
      parseFile,
      astFromTwinFile,
      getAstFileID,
      getAstFileDeps,
      getRootJSXElements,
      babelParse,
      getJSXElementChilds,
      jSXElementToTwinNode,
      getModuleDependencies,
      getJSXElementId,
      getJSXElementNodeId,
      getModuleId,
      findModuleDependency,
      registerModuleComponent,
      compileClassNameAttribute,
      injectModuleStyleSheet,
    };
  }),
}) {}

const plugins: _babelParser.ParserPlugin[] = ['typescript', 'jsx'];

const babelParserOptions: _babelParser.ParserOptions = {
  plugins,
  sourceType: 'module',
  errorRecovery: true,
  ranges: true,
  allowUndeclaredExports: true,
  attachComment: false,
};

const parser = _babelParser.parse.bind(_babelParser);

function babelParse(code: string | Buffer, fileName?: string): _babelModels.BabelFileAst {
  const codeString = code.toString();
  try {
    return parser(codeString, {
      ...babelParserOptions,
      sourceFilename: fileName ?? '',
    });
  } catch (err) {
    throw new Error(
      `Error parsing babel: ${err} in ${fileName}, code:\n${codeString}\n ${(err as any).stack}`,
    );
  }
}

const astFromTwinFile = (file: TwinFile): Effect.Effect<_babelModels.TwinModuleAst> => {
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
        transform: (jsxElement) => jSXElementToTwinNode(jsxElement, { dependencies, file }),
      });
      return new _babelModels.TwinJSXElement({ file, jsxFunction, meta, tree });
    }),
    Stream.runCollect,
    Effect.map(RA.fromIterable),
    Effect.map((jsxElements) => {
      const module = new _babelModels.TwinModuleAst({
        ast,
        file,
        jsxElements,
        dependencies,
        registerComponents: t.arrayExpression(),
      });
      injectModuleStyleSheet(module);
      return module;
    }),
  );
};

/** @domain Babel — stable id derived from the JSXElement declarator function */
export const getJSXElementId = (element: _babelModels.TwinJSXElement): string =>
  element.jsxFunction.pipe(
    Option.map((x) => [x.node.start, x.node.end].join('/')),
    Option.getOrElse(() => ''),
    (_) =>
      `_JSXElement:${Hash.string(`${_}${element.file.path}${element.meta.isExported}${element.meta.name}`)}`,
  );

/** @domain Babel — stable id derived from a JSXElement node, its deps and classNames */
export const getJSXElementNodeId = (node: _babelModels.TwinJSXElementNode): string => {
  const data = node.classNameProps.map((x) => x.text).join(',');
  return node.dependency.pipe(
    Option.map((dep) => `${dep.filepath}_${dep.localName}_${dep.originalSource}_${dep.exportName}`),
    Option.getOrElse(() => 'NoDep'),
    (dep) =>
      `__JSXElementNode:${Hash.string(node.file.path)}:${dep}:${node.name}:${Hash.string(data)}`,
    Hash.string,
    (id) => Math.abs(id).toString(),
  );
};

/** @domain Babel — stable id for a module derived from its file basename + path */
export const getModuleId = (module: _babelModels.TwinModuleAst): string =>
  `${module.file.basename}:${Hash.string(module.file.path)}`;

/** @domain Babel — find the exported JSXElement in `module` matching `dep` */
export const findModuleDependency = (
  module: _babelModels.TwinModuleAst,
  dep: _babelModels.ModuleDependency,
): Option.Option<_babelModels.TwinJSXElement> => {
  if (!module.file.path.startsWith(dep.filepath)) return Option.none();
  return RA.findFirst(module.jsxElements, (x) => dep.exportName === x.meta.name);
};

/** @domain Babel — push a runtime component into the module register array node */
export const registerModuleComponent = (
  module: _babelModels.TwinModuleAst,
  jsx: TwinRuntimeComponent,
): void => {
  const ast = literalValueToAst(jsx);
  module.registerComponents.elements.push(ast);
};

/** @domain Babel — strip/replace the className attribute AST in place */
export const compileClassNameAttribute = (prop: _babelModels.TwinJSXClassnameProp): void => {
  const value = prop.ast.get('value');
  if (value.isStringLiteral()) {
    prop.ast.remove();
  }
  if (value.isJSXExpressionContainer()) {
    const expression = value.get('expression');
    if (expression.isStringLiteral()) return void prop.ast.remove();

    if (expression.isTemplateLiteral()) {
      Option.tap(prop.expression, (x) => {
        expression.replaceWith(x.cookedExp);
        return Option.void;
      });
    }
  }
  value.scope.crawl();
};

/** @domain Babel — inject the StyleSheet import + register call into the module program */
export const injectModuleStyleSheet = (module: _babelModels.TwinModuleAst): void => {
  if (module.jsxElements.length === 0) return;
  module.ast.program = t.removeComments(module.ast.program);
  t.addComment(module.ast.program, 'inner', ' @ts-noCheck', true);
  module.ast.program.body.unshift(_babelUtils.babelTemplates.importRNStyleSheet() as t.Statement);
  module.ast.program.body.push(
    ...asArray(
      _babelUtils.babelTemplates.twinStoreRegisterJSX({
        STYLESHEET_VAR_NAME: _babelModels.TWIN_STYLESHEET_IMPORT,
        RUNTIME_COMPONENTS: module.registerComponents,
      }),
    ),
  );
};

const findJsxElementDependency = (
  jsxElement: _babelModels.JSXElementPath,
  dependencies: _babelModels.ModuleDependency[],
): Option.Option<_babelModels.ModuleDependency> => {
  const ident = jsxElement.node.openingElement.name;
  if (!t.isJSXIdentifier(ident)) return Option.none();

  return Option.fromNullable(jsxElement.scope.getBinding(ident.name)).pipe(
    Option.andThen(_babelUtils.getBabelBindingImportSource),
    Option.map((importSource) =>
      TwinPath.NodePath.resolve(
        TwinPath.NodePath.dirname(_babelUtils.getSourceLocation(jsxElement.node).filename),
        importSource.source,
      ),
    ),
    Option.andThen((resolvedPath) =>
      RA.findFirst(dependencies, (x) => x.filepath.startsWith(resolvedPath)),
    ),
  );
};

const jSXElementToTwinNode = (
  path: _babelModels.JSXElementPath,
  options: { dependencies: _babelModels.ModuleDependency[]; file: TwinFile },
) => {
  const ident = path.node.openingElement.name;
  if (!t.isJSXIdentifier(ident)) return null;

  const dependency = findJsxElementDependency(path, options.dependencies);
  const mappedProps = RA.findFirst(mappedComponents, (x) => x.name === ident.name).pipe(
    Option.getOrElse(
      (): MappedComponent => ({
        name: ident.name,
        config: {
          className: 'style',
        },
        kind: 'unknown',
      }),
    ),
  );
  const classNameProps = getClassNamePropsFromJSX(path, mappedProps);
  return new _babelModels.TwinJSXElementNode({
    file: options.file,
    dependency,
    babelPath: path,
    name: ident.name,
    classNameProps,
    mappedProps,
  });
};

const getJSXElementChilds = (
  jsxElement: _babelModels.JSXElementPath,
): _babelModels.JSXElementPath[] => {
  const childAttrs = pathJSXAttributeChilds(jsxElement.get('openingElement'));
  return jsxElement
    .get('children')
    .filter((x) => x.isJSXElement())
    .concat(childAttrs);
};

const pathJSXAttributeChilds = (openingElement: _babelModels.JSXOpeningElementPath) => {
  const jsxAttrs: _babelModels.JSXElementPath[] = [];
  for (const attr of openingElement.get('attributes')) {
    attr.traverse({
      JSXElement: (path) => {
        jsxAttrs.push(path);
        path.skip();
      },
    });
  }
  return jsxAttrs;
};

const getRootJSXElements = (ast: _babelModels.BabelFileAst) =>
  Stream.async<_babelModels.JSXElementPath>((emit) => {
    traverse(
      ast,
      {
        Program: {
          exit() {
            emit.end();
          },
        },
        JSXElement(path) {
          emit.single(path);
          path.skip();
        },
      },
      undefined,
    );
  });

const getModuleDependencies = (ast: _babelModels.BabelFileAst, filename: TwinPath.FilePath) => {
  const dependencies: _babelModels.ModuleDependency[] = [];
  for (const statement of ast.program.body) {
    if (!t.isImportDeclaration(statement)) continue;
    const importPath = statement.source.value;
    const isLocal = _babelUtils.isLocalImport(importPath);

    const fullPath = isLocal
      ? TwinPath.AbsolutePath.make(
          TwinPath.NodePath.resolve(TwinPath.NodePath.dirname(filename), importPath),
        )
      : TwinPath.npmModulePathFromString(importPath);

    for (const specifier of statement.specifiers) {
      if (!t.isImportSpecifier(specifier)) continue;
      if (!t.isIdentifier(specifier.imported)) continue;

      dependencies.push({
        exportName: specifier.imported.name,
        filepath: fullPath,
        isLocal,
        localName: specifier.local.name,
        originalSource: importPath,
        isReactNativeImport: importPath === 'react-native',
      });
    }
  }

  return dependencies;
};

const getJSXElementFunction = (
  jsxPath: _babelModels.JSXElementPath,
): Option.Option<_babelModels.JSXElementFunction> => {
  let compFn: _babelModels.AnyNodePath | null = jsxPath.findParent(_babelUtils.isFunction);
  while (compFn) {
    const parent = compFn.findParent(_babelUtils.isFunction);
    if (parent) compFn = parent;
    else break;
  }
  if (!compFn) {
    console.error('Cant find the component top most function');
    return Option.none();
  }
  return Option.liftPredicate(compFn, (x) => _babelUtils.isFunction(x));
};

const getDeclaratorData = (
  node: _babelModels.JSXElementFunction,
): _babelModels.TwinJSXElement['meta'] => {
  let name: _babelModels.TwinJSXElement['meta']['name'] = '__Unknown';
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

const getClassNamePropsFromJSX = (
  jsxElement: _babelModels.JSXElementPath,
  mappedConfig: MappedComponent,
) => {
  const classNameProps: _babelModels.TwinJSXClassnameProp[] = [];
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
    const ast = getJSXAttributeValue(attribute);
    if (!ast) continue;

    const value = getPropValueString(ast);
    classNameProps.push(
      new _babelModels.TwinJSXClassnameProp({
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
const getJSXAttributeValue = (attribute: _babelModels.JSXAttributePath) => {
  if (!t.isJSXIdentifier(attribute.node.name)) return null;

  let ast: NodePath<t.TemplateLiteral | t.StringLiteral> | undefined;

  const value = attribute.get('value');
  if (value.isStringLiteral()) {
    ast = value;
  }

  if (value.isJSXExpressionContainer()) {
    const expression = value.get('expression');
    if (expression.isTemplateLiteral()) {
      ast = expression;
    }
    if (expression.isCallExpression()) {
      expression.replaceWith(
        t.templateLiteral(
          [t.templateElement({ raw: '', cooked: '' }), t.templateElement({ raw: '', cooked: '' })],
          [expression.node],
        ),
      );
      ast = expression as any;
    }
  }
  if (!ast) return null;

  return ast;
};

const getPropValueString = (path: NodePath<t.StringLiteral | t.TemplateLiteral>) => {
  if (t.isStringLiteral(path.node)) {
    const text = cx`${path.node.value}`;
    return {
      text,
      twinRules: parseTWTokens(text),
      templateExpression: Option.none<_babelModels.JSXClassPropExpression>(),
    };
  }
  const cooked = templateLiteralToStringLike(path.node);

  const text = cx`${cooked.strings}`;
  return {
    text,
    twinRules: parseTWTokens(text),
    templateExpression: Option.liftPredicate(path, (x) => x.isTemplateLiteral()).pipe(
      Option.map(
        (_): _babelModels.JSXClassPropExpression => ({
          expression: _,
          cookedExp: cooked.expressions,
          text: new CodeGenerator(cooked.expressions).generate().code,
        }),
      ),
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
