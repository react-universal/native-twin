import type { NodePath } from '@babel/traverse';
import type * as t from '@babel/types';
import type { Tree } from '@native-twin/helpers/tree';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import type * as Option from 'effect/Option';
import type { TwinPath } from '../internal/fs';
import type { MappedComponent } from '../shared/compiler.constants';

export type ImportKind = 'require' | 'import' | 'local';

export interface InputFile {
  filename: string;
  content?: string | undefined;
}

export interface ComponentRef {
  elementName: t.JSXIdentifier;
  mapped: MappedComponent;
  importKind: ImportKind;
  importSource: string;
}
export interface LoadedComponent {
  babelPath: NodePath<t.JSXElement>;
  ref: Option.Option<ComponentRef>;
}

export interface ComponentDeclarator {
  declarator: NodePath<t.Node>;
  name: string;
  isExported: boolean;
  tree: Tree<LoadedComponent>;
}

export interface LoadedModule {
  filename: TwinPath.AbsoluteFilePath;
  content: string;
  refs: Map<string, ComponentRef>;
  components: Map<string, ComponentDeclarator>;
}

export class ResolvedModule {
  // MARK: Computed props
  get filepath() {
    return this.resolved.filename;
  }
  get content() {
    return this.resolved.content;
  }
  get components() {
    return this.resolved.components;
  }
  get refs() {
    return this.resolved.refs;
  }
  get key() {
    return new ResolverInput(this.filepath, this.content);
  }
  // MARK: init
  constructor(private readonly resolved: LoadedModule) {}

  hasExportedComponent(name: string) {
    return this.components.has(name);
  }
}

export class ResolverInput implements Equal.Equal {
  constructor(
    readonly filename: TwinPath.AbsoluteFilePath,
    readonly content: string,
  ) {}

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof ResolverInput &&
      that.filename === this.filename &&
      that[Hash.symbol]() === this[Hash.symbol]()
    );
  }

  [Hash.symbol](): number {
    return Hash.combine(Hash.string(this.filename))(Hash.string(this.content));
  }
}
