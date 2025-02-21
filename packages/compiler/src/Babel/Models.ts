import type { ParseResult } from '@babel/parser';
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import type { SheetEntryHandler } from '@native-twin/css/jsx';
import * as Tree from '@native-twin/helpers/tree';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import * as Stream from 'effect/Stream';
import { TwinPath } from '../FileSystem';
import type { JSXMappedAttribute } from '../models/JSXElement.model';
import { type MappedComponent, mappedComponents } from '../shared/compiler.constants';
import {
  extractStyledProp,
  getBabelBindingImportSource,
  getJSXElementAttrs,
  isLocalImport,
} from './Utils';

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
  filepath: TwinPath.ImportPath,
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

  findDomElement(name: string) {
    return this.domElements.pipe(
      Stream.find((element) => element.name === name),
      Stream.runHead,
    );
  }

  findDomElementDependency(domElement: TwinDomElement) {
    const importPath = domElement.importSource.source;
    const absImportPath = TwinPath.NodePath.resolve(this.dirname, importPath);
    return RA.findFirst(this.dependencies, (x) => x.filepath.startsWith(absImportPath));
  }
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

export class TwinCompilerDom {
  readonly tree: Tree.Tree<TwinDomElement>;

  private get rootElement() {
    return this.declarator.rootJSXElement;
  }

  get name() {
    return this.declarator.name;
  }

  constructor(private readonly declarator: JSXElementDeclaration) {
    const ident = this.rootElement.node.openingElement.name;
    const name = t.isJSXIdentifier(ident) ? ident.name : 'UnknownRootElement';
    this.tree = new Tree.Tree(new TwinDomElement(this.rootElement, name));
    this.buildTree(this.tree.root);
  }

  private buildTree(parent: Tree.TreeNode<TwinDomElement>) {
    const childs = parent.value.jsxPath.get('children').filter((x) => x.isJSXElement());
    for (const child of childs) {
      const ident = child.node.openingElement.name;
      if (!t.isJSXIdentifier(ident)) continue;

      const childLeave = parent.addChild(new TwinDomElement(child, ident.name), parent);
      this.buildTree(childLeave);
    }
  }
}

export class TwinDomElement {
  private get binding() {
    return Option.fromNullable(this.jsxPath.scope.getBinding(this.name));
  }
  get importSource(): ImportSource {
    return Option.flatMap(this.binding, getBabelBindingImportSource).pipe(
      Option.getOrElse((): ImportSource => ({ kind: 'unknown', source: 'none' })),
    );
  }
  get mappedProps(): MappedComponent {
    return RA.findFirst(mappedComponents, (x) => x.name === this.name).pipe(
      Option.getOrElse(() => ({ name: this.name, config: {} })),
    );
  }
  get isLocalImport() {
    return (
      (this.importSource.kind === 'import' || this.importSource.kind === 'require') &&
      isLocalImport(this.importSource.source)
    );
  }
  get styledProps() {
    return pipe(
      getJSXElementAttrs(this.jsxPath.node),
      RA.map((x) => Option.fromNullable(extractStyledProp(x, this.mappedProps))),
      RA.getSomes,
    );
  }
  constructor(
    readonly jsxPath: NodePath<t.JSXElement>,
    readonly name: string,
  ) {}
}
