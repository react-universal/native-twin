import * as Data from 'effect/Data';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import type { JSXElementPath } from '../Babel';
import type { TwinFile } from '../FileSystem';
import type { MappedComponent } from '../utils/constants';
import type { TwinJSXClassnameProp } from './JSXStyledProp';
import type { ModuleDependency } from './TwinAst';

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
  node: Pick<TwinJSXElementNode, 'dependency' | 'name' | 'file'>,
): string => {
  return node.dependency.pipe(
    Option.map((dep) => `${dep.filepath}_${dep.localName}_${dep.originalSource}_${dep.exportName}`),
    Option.getOrElse(() => 'NoDep'),
    (dep) => `__JSXElementNode:${Hash.string(node.file.path)}:${dep}:${node.name}`,
    Hash.string,
    (id) => Math.abs(id).toString(),
  );
};
