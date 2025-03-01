import type * as Tree from '@native-twin/helpers/tree';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import type { TwinFile } from '../../FileSystem';
import type { JSXElementFunction } from '../Models';
import type { TwinJSXElementNode } from './TwinJSXElementNode';

export class TwinJSXElement {
  /** Describe the function that returns a JSXElement */
  readonly id: string;

  constructor(
    file: TwinFile,
    readonly jsxFunction: Option.Option<JSXElementFunction>,
    readonly meta: { isExported: boolean; name: '__Unknown' | (string & {}) },
    readonly tree: Tree.Tree<TwinJSXElementNode>,
  ) {
    this.id = this.jsxFunction.pipe(
      Option.map((x) => [x.node.start, x.node.end].join('/')),
      Option.getOrElse(() => ''),
      (_) =>
        `_JSXElement:${Hash.string(`${_}${file.path}${this.meta.isExported}${this.meta.name}`)}`,
    );
  }

  get allNodes() {
    return this.tree.all();
  }
}
