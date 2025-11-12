import type { MappedComponent } from '@native-twin/core';
import type * as Tree from '@native-twin/helpers/tree';
import * as Data from 'effect/Data';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import type { JSXElementFunction, JSXElementPath } from '../Babel';
import type { TwinFile } from '../FileSystem';
import type { TwinJSXClassnameProp } from './JSXStyledProp';
import type { ModuleDependency } from './TwinAst';

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
  private readonly _id: string;
  constructor(data: InstanceType<typeof JSXElementNodeConstructor>) {
    super(data);
    this._id = getJSXElementNodeID(data);
  }

  get id() {
    return this._id;
  }
  get hasExpressions() {
    return this.classNameProps.some((x) => x.hasExpression);
  }
}

const getJSXElementNodeID = (
  node: Pick<TwinJSXElementNode, 'dependency' | 'name' | 'file' | 'classNameProps'>,
): string => {
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
