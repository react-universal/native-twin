import type { ParseResult } from '@babel/parser';
import type { NodePath } from '@babel/traverse';
import type * as t from '@babel/types';

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
  cookedExp: t.TemplateLiteral,
  text: string;
}