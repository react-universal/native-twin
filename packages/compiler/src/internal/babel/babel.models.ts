import type { ParseResult } from '@babel/parser';
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import type { MappedComponent } from '@native-twin/core';
import type { TWParsedRule } from '@native-twin/css';
import type { TwinRuntimeComponent } from '@native-twin/css/jsx';
import { asArray } from '@native-twin/helpers';
import type * as Tree from '@native-twin/helpers/tree';
import * as Data from 'effect/Data';
import * as Hash from 'effect/Hash';
import * as Iterable from 'effect/Iterable';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import { literalValueToAst } from '../../utils/babel/babel.utils';
import type { TwinFile } from '../fs';
import type * as TwinPath from '../path';
import { babelTemplates } from './babel.utils';

export const TWIN_MODULE_STYLES_OBJECT_VAR_NAME = '_____Twin__Module__Styles';
export const TWIN_STYLESHEET_IMPORT = '__ReactNativeStyleSheet';
// export const TWIN_STORE_IMPORT = '__TwinStoreHandler';

export type JSXElementNode = t.JSXElement;
export type JSXElementPath = NodePath<JSXElementNode>;
export type JSXOpeningElementPath = NodePath<t.JSXOpeningElement>;
export type BabelFileAst = ParseResult<t.File>;
type AnyNode = t.Node;
export type AnyNodePath = NodePath<AnyNode>;
// type FileProgram = t.Program;
// export type FileProgramPath = NodePath<FileProgram>;

export type JSXElementFunction =
  | NodePath<t.ArrowFunctionExpression>
  | NodePath<t.FunctionDeclaration>
  | NodePath<t.FunctionExpression>;

export type ImportKind = 'require' | 'import' | 'local' | 'unknown';
export interface ImportSource {
  kind: ImportKind;
  source: 'none' | (string & {});
}
export type JSXAttributeNode = t.JSXAttribute;
export type JSXAttributePath = NodePath<JSXAttributeNode>;

export interface CompilerInput {
  code: string;
  filename: string;
  outputCSS: string;
  platform: string;
  inputCSS: string;
  projectRoot: string;
  twinConfigPath: string;
}

/** @domain jsx import babel plugin */
export type BabelCallValue = t.CallExpression['arguments'][0];

/** @domain jsx import babel plugin */
export interface APICallerOptions {
  engine: string | null;
  isServer: boolean;
  isDev: boolean;
  platform: string;
}

/** @domain jsx import babel plugin */
export interface BabelAPI {
  types: typeof t;
  caller: <T>(caller: (data?: APICallerOptions) => T) => NonNullable<T>;
  cache: (x: boolean) => void;
}

/** @domain jsx import babel plugin */
export interface TwinBabelPluginOptions extends APICallerOptions {
  twinConfigPath?: string;
  inputCSS?: string;
  outputDir?: string;
}

export interface JSXClassPropExpression {
  expression: NodePath<t.TemplateLiteral>;
  cookedExp: t.TemplateLiteral;
  text: string;
}

export interface ModuleDependency {
  originalSource: string;
  filepath: TwinPath.ImportPath;
  isLocal: boolean;
  /** 
   @description Variable name on the current module  
   @example ```
    import { Comp as LocalName } from '...'
   ```
   where LocalName is the value of this prop
   **/
  localName: string;
  /** Original name on the imported file */
  exportName: string;
  isReactNativeImport: boolean;
}

export interface JSXClassPropExpression {
  expression: NodePath<t.TemplateLiteral>;
  cookedExp: t.TemplateLiteral;
  text: string;
}

export class TwinJSXElement {
  /** Describe the function that returns a JSXElement */
  private _id: string | null = null;
  private readonly _tree: Tree.Tree<TwinJSXElementNode> | null = null;

  constructor(
    private readonly file: TwinFile,
    readonly jsxFunction: Option.Option<JSXElementFunction>,
    readonly meta: { isExported: boolean; name: '__Unknown' | (string & {}) },
    readonly tree: Tree.Tree<TwinJSXElementNode>,
  ) {}

  get id() {
    if (this._id) return this._id;
    this._id = this.jsxFunction.pipe(
      Option.map((x) => [x.node.start, x.node.end].join('/')),
      Option.getOrElse(() => ''),
      (_) =>
        `_JSXElement:${Hash.string(`${_}${this.file.path}${this.meta.isExported}${this.meta.name}`)}`,
    );
    return this._id;
  }

  get jsxTree() {
    if (this._tree) return this._tree;

    return this._tree;
  }

  get childIDS() {
    return this._tree?.root.children.map((x) => x.value.id) ?? [];
  }

  get allNodes() {
    return this.tree.all();
  }
}

const JSXElementNodeConstructor = Data.Class<{
  readonly mappedProps: MappedComponent;
  readonly classNameProps: TwinJSXClassnameProp[];
  readonly file: TwinFile;
  readonly babelPath: JSXElementPath;
  readonly name: string;
  readonly dependency: Option.Option<ModuleDependency>;
}>;

export class TwinJSXElementNode extends JSXElementNodeConstructor {
  constructor(data: InstanceType<typeof JSXElementNodeConstructor>) {
    super(data);
  }

  get id() {
    const data = this.classNameProps.map((x) => x.text).join(',');
    return this.dependency.pipe(
      Option.map(
        (dep) => `${dep.filepath}_${dep.localName}_${dep.originalSource}_${dep.exportName}`,
      ),
      Option.getOrElse(() => 'NoDep'),
      (dep) =>
        `__JSXElementNode:${Hash.string(this.file.path)}:${dep}:${this.name}:${Hash.string(data)}`,
      Hash.string,
      (id) => Math.abs(id).toString(),
    );
  }

  get hasExpressions() {
    return this.classNameProps.some((x) => x.hasExpression);
  }
}

export class TwinModuleAst extends Data.Class<{
  readonly ast: BabelFileAst;
  readonly file: TwinFile;
  readonly jsxElements: TwinJSXElement[];
  readonly dependencies: ModuleDependency[];
}> {
  private _registerComponents = t.arrayExpression();

  constructor(data: {
    ast: BabelFileAst;
    file: TwinFile;
    jsxElements: TwinJSXElement[];
    dependencies: ModuleDependency[];
  }) {
    super(data);

    if (this.jsxElements.length > 0) {
      this.ast.program = t.removeComments(this.ast.program);
      t.addComment(this.ast.program, 'inner', ' @ts-noCheck', true);
      this.ast.program.body.unshift(
        babelTemplates.importRNStyleSheet() as t.Statement,
        // createBabelVariable(TWIN_STYLESHEET_IMPORT, createRequireExpression('@native-twin/jsx')),
      );
      // this.ast.program.body.unshift(
      //   babelTemplates.importTwinStore({
      //     TWIN_STORE_HANDLER_VAR: t.identifier(TWIN_STORE_IMPORT),
      //   }) as t.Statement,
      // );
      this.ast.program.body.push(
        ...asArray(
          babelTemplates.twinStoreRegisterJSX({
            STYLESHEET_VAR_NAME: TWIN_STYLESHEET_IMPORT,
            RUNTIME_COMPONENTS: this._registerComponents,
          }),
        ),
      );
    }
  }

  get id() {
    const { path, basename } = this.file;
    return `${basename}:${Hash.string(path)}`;
  }

  toDependenciesStream() {
    return Stream.fromIterable(this.dependencies);
  }

  isImportPath(path: TwinPath.ImportPath) {
    return this.file.path.startsWith(path);
  }

  findDependency(dep: ModuleDependency) {
    if (!this.file.path.startsWith(dep.filepath)) return Option.none();
    return Iterable.findFirst(this.jsxElements, (x) => dep.exportName === x.meta.name);
  }

  getJSXElementFromNode(node: TwinJSXElementNode) {
    return Option.andThen(node.dependency, (dependency) => this.findDependency(dependency));
  }

  registerComponent(jsx: TwinRuntimeComponent) {
    this._registerComponents.elements.push(literalValueToAst(jsx));
  }

  addStyleRegistryExp(exp: t.Statement) {
    this.ast.program.body.push(exp);
  }
}

const ConstructorProp = Data.Class<{
  ast: JSXAttributePath;
  text: string;
  expression: Option.Option<JSXClassPropExpression>;
  twinRules: TWParsedRule[];
  prop: string;
  target: string;
}>;

export class TwinJSXClassnameProp extends ConstructorProp {
  // private _ownTwinRules: TWParsedRule[] | null = null;
  // private _childRules: TWParsedRule[] | null = null;
  constructor(input: InstanceType<typeof ConstructorProp>) {
    super(input);
  }

  get classname() {
    return Option.map(this.expression, (x) => x.text)
      .pipe(Option.getOrElse(() => ''))
      .concat(this.text);
  }

  compileAttribute() {
    const value = this.ast.get('value');
    if (value.isStringLiteral()) {
      this.ast.remove();
    }
    if (value.isJSXExpressionContainer()) {
      const expression = value.get('expression');
      if (expression.isStringLiteral()) return this.ast.remove();
      if (expression.isTemplateLiteral()) {
        Option.tap(this.expression, (x) => {
          expression.replaceWith(x.cookedExp);
          return Option.void;
        });
      }
    }
    value.scope.crawl();
  }

  // get ownRules() {
  //   if (!this._ownTwinRules) {
  //     this._ownTwinRules = this.twinRules.filter((x) => {
  //       const variants = getRuleSelectorGroups(x.v);
  //       return !variants.some(Predicates.isChildSelector);
  //     });
  //   }
  //   return this._ownTwinRules;
  // }

  // get childRules() {
  //   if (!this._childRules) {
  //     this._childRules = this.twinRules.filter((x) => {
  //       const variants = getRuleSelectorGroups(x.v);
  //       return variants.some(Predicates.isChildSelector);
  //     });
  //   }
  //   return this._childRules;
  // }

  get hasExpression() {
    return Option.isSome(this.expression);
  }
}

// export class TwinStyledProp extends Data.Class<{
//   readonly prop: TwinJSXClassnameProp;
//   readonly entries: SheetEntry[];
// }> {
//   get parsedEntries() {
//     return this.entries.map((x) => new SheetEntryParser(x));
//   }
// }
