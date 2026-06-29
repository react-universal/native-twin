import type { ParseResult } from '@babel/parser';
import type { NodePath } from '@babel/traverse';
import type * as t from '@babel/types';
import type { MappedComponent } from '@native-twin/core';
import type { TWParsedRule } from '@native-twin/css';
import type * as Tree from '@native-twin/helpers/tree';
import * as Data from 'effect/Data';
import type * as Option from 'effect/Option';
import type { TwinFile } from '../fs';
import type * as TwinPath from '../path';

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

export class TwinJSXElement extends Data.Class<{
  readonly file: TwinFile;
  /** Describe the function that returns a JSXElement */
  readonly jsxFunction: Option.Option<JSXElementFunction>;
  readonly meta: { isExported: boolean; name: '__Unknown' | (string & {}) };
  readonly tree: Tree.Tree<TwinJSXElementNode>;
}> {}

export class TwinJSXElementNode extends Data.Class<{
  readonly mappedProps: MappedComponent;
  readonly classNameProps: TwinJSXClassnameProp[];
  readonly file: TwinFile;
  readonly babelPath: JSXElementPath;
  readonly name: string;
  readonly dependency: Option.Option<ModuleDependency>;
}> {}

export class TwinModuleAst extends Data.Class<{
  readonly ast: BabelFileAst;
  readonly file: TwinFile;
  readonly jsxElements: TwinJSXElement[];
  readonly dependencies: ModuleDependency[];
  /** Array expression node holding the registered runtime components */
  readonly registerComponents: t.ArrayExpression;
}> {}

export class TwinJSXClassnameProp extends Data.Class<{
  ast: JSXAttributePath;
  text: string;
  expression: Option.Option<JSXClassPropExpression>;
  twinRules: TWParsedRule[];
  prop: string;
  target: string;
}> {}
