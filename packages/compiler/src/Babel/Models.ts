import type { ParseResult } from '@babel/parser';
import type { NodePath } from '@babel/traverse';
import type * as t from '@babel/types';
import type { SheetEntryHandler } from '@native-twin/css/jsx';
import * as RA from 'effect/Array';
import * as Hash from 'effect/Hash';
import * as Schema from 'effect/Schema';
import * as Stream from 'effect/Stream';
import * as TwinPath from '../FileSystem/Path.model';
import type { JSXMappedAttribute } from '../models/JSXElement.model';
import { TwinCompilerDom } from './BabelDom';

export type JSXElementNode = t.JSXElement;
export type JSXElementPath = NodePath<JSXElementNode>;
export type BabelFileAst = ParseResult<t.File>;
export type AnyNode = t.Node;
export type AnyNodePath = NodePath<AnyNode>;

export type JSXElementFunction =
  | NodePath<t.ArrowFunctionExpression>
  | NodePath<t.FunctionDeclaration>
  | NodePath<t.FunctionExpression>;

export type ImportKind = 'require' | 'import' | 'local' | 'unknown';
export interface ImportSource {
  kind: ImportKind;
  source: 'none' | (string & {});
}

export class ModuleDependency extends Schema.Class<ModuleDependency>('ModuleDependency')({
  originalSource: Schema.String,
  filepath: TwinPath.AbsolutePath,
  isLocal: Schema.Boolean,
  localName: Schema.String,
  exportName: Schema.String,
}) {
  get fromReactNative() {
    return this.originalSource === 'react-native';
  }
}

export class BabelModule {
  get id() {
    return `${this.name}:${Hash.string(this.filepath)}`;
  }
  get name() {
    return TwinPath.NodePath.basename(this.filepath);
  }
  get dirname() {
    return TwinPath.absolutePathFromString(TwinPath.NodePath.dirname(this.filepath));
  }
  get isJSX() {
    return this.name.endsWith('.tsx') || this.name.endsWith('.jsx');
  }
  get dependencies() {
    return this._dependencies;
  }
  get domElements() {
    return this.definitions.pipe(Stream.map((x) => new TwinCompilerDom(x)));
  }
  get ast() {
    return this._ast;
  }

  constructor(
    readonly filepath: TwinPath.FilePath,
    readonly code: string,
    private readonly _ast: BabelFileAst,
    private readonly _dependencies: ModuleDependency[],
    readonly _rootComponents: Stream.Stream<JSXElementPath>,
    /** Component definitions in module */
    readonly definitions: Stream.Stream<JSXElementDeclaration>,
  ) {}
}

export class JSXElementDeclaration {
  constructor(
    readonly name: string,
    readonly isExported: boolean,
    readonly declaratorAst: JSXElementFunction,
    readonly rootJSXElement: NodePath<t.JSXElement>,
  ) {}

  private get docRange() {
    return [this.declaratorAst.node.start, this.declaratorAst.node.end];
  }
  get id() {
    return `${this.name}:${Hash.array(this.docRange)}`;
  }
}

export class ComponentStyledProp {
  readonly entries: SheetEntryHandler[];
  readonly childEntries: SheetEntryHandler[];
  constructor(
    readonly prop: JSXMappedAttribute,
    entries: SheetEntryHandler[],
  ) {
    [this.entries, this.childEntries] = RA.partition(entries, (x) => x.isChildEntry());
  }
}
