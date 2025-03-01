import type { ParseResult } from '@babel/parser';
import type { NodePath } from '@babel/traverse';
import type * as t from '@babel/types';
import * as Data from 'effect/Data';
import * as Iterable from 'effect/Iterable';
import * as Option from 'effect/Option';
import type { TwinFile, TwinPath } from '../FileSystem';
import type { TwinJSXElementNode } from './models/TwinJSXElementNode';
import type { TwinJSXElement } from './models/TwinJSXElement';

export class TwinBabelModule extends Data.Class<{
  readonly ast: BabelFileAst;
  readonly file: TwinFile;
  readonly jsxElements: Iterable<TwinJSXElement>;
  readonly dependencies: Iterable<ModuleDependency>;
}> {
  findDependency(dep: ModuleDependency) {
    if (!this.file.path.startsWith(dep.filepath)) return Option.none();
    return Iterable.findFirst(this.jsxElements, (x) => dep.exportName === x.meta.name);
  }

  getJSXElementFromNode(node: TwinJSXElementNode) {
    return Option.andThen(node.dependency, (dependency) =>
      this.findDependency(dependency),
    );
  }
}

export class TwinBabelError extends Data.TaggedError('TwinBabelError')<{
  cause: Error;
  message: string;
}> {}

export class ModuleDependency extends Data.Class<{
  originalSource: string;
  filepath: TwinPath.ImportPath;
  isLocal: boolean;
  localName: string;
  exportName: string;
}> {
  get fromReactNative() {
    return this.originalSource === 'react-native';
  }
}
export type JSXElementNode = t.JSXElement;
export type JSXElementPath = NodePath<JSXElementNode>;
export type BabelFileAst = ParseResult<t.File>;
export type AnyNode = t.Node;
export type AnyNodePath = NodePath<AnyNode>;
export type FileProgram = t.Program;
export type FileProgramPath = NodePath<FileProgram>;

export type JSXElementFunction =
  | NodePath<t.ArrowFunctionExpression>
  | NodePath<t.FunctionDeclaration>
  | NodePath<t.FunctionExpression>;

export type ImportKind = 'require' | 'import' | 'local' | 'unknown';
export interface ImportSource {
  kind: ImportKind;
  source: 'none' | (string & {});
}

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
