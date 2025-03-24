import * as Data from 'effect/Data';
import * as Hash from 'effect/Hash';
import * as Iterable from 'effect/Iterable';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import type { BabelFileAst } from '../Babel';
import type { TwinFile, TwinPath } from '../FileSystem';
import type { TwinJSXElement } from './TwinJSXElement';
import type { TwinJSXElementNode } from './TwinJSXElementNode';

export class TwinBabelModule extends Data.Class<{
  readonly ast: BabelFileAst;
  readonly file: TwinFile;
  readonly jsxElements: TwinJSXElement[];
  readonly dependencies: ModuleDependency[];
}> {
  get id() {
    const { path, basename } = this.file;
    return `${basename}:${Hash.string(path)}`;
  }

  toJSXElementStream() {
    return Stream.fromIterable(this.dependencies);
  }

  isImportPath(path: TwinPath.ImportPath) {
    return this.file.path.startsWith(path);
  }

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

export class ModuleDependency extends Data.Class<{
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
}> {
  get fromReactNative() {
    return this.originalSource === 'react-native';
  }
}
