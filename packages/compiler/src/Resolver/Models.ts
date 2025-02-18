import type { ParseResult } from '@babel/parser';
import type { NodePath } from '@babel/traverse';
import type * as t from '@babel/types';
import type { Tree } from '@native-twin/helpers/tree';
import * as Hash from 'effect/Hash';
import { TwinFileResult } from '../FileSystem/Models';
import type { TwinPath } from '../internal/fs';
import type { MappedComponent } from '../shared/compiler.constants';

export type ImportKind = 'require' | 'import' | 'local' | 'unknown';
export interface ImportSource {
  kind: ImportKind;
  source: 'none' | (string & {});
}

export class ResolvedModule {
  // MARK: Computed props
  get key() {
    return new TwinFileResult(this.filename, this.content);
  }
  get id() {
    return `#${this.key[Hash.symbol]()}`;
  }
  // MARK: init
  constructor(
    readonly filename: TwinPath.FullFilePath,
    readonly content: string,
    readonly ast: ParseResult<t.File>,
    readonly components: ModuleComponent[],
  ) {}
}

export class TwinFileModule {
  constructor(readonly module: ResolvedModule) {}
}

export interface ComponentRef {
  elementName: string;
  mapped: MappedComponent;
  origin: ImportSource;
}

export interface LoadedComponent {
  babelPath: NodePath<t.JSXElement>;
  ref: ComponentRef;
}
export interface ComponentDeclarator {
  name: string;
  isExported: boolean;
}

export class ModuleComponent {
  constructor(
    readonly babelPath: NodePath<t.JSXElement>,
    readonly declarator: ComponentDeclarator,
    readonly tree: Tree<LoadedComponent>,
  ) {}

  get id() {
    const nameHash = Hash.string(this.declarator.name);
    const loc = Hash.array([
      this.babelPath.node.start ?? -1,
      this.babelPath.node.end ?? -1,
    ]);
    return `#${Hash.combine(nameHash)(loc)}`;
  }
}
