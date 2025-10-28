import * as t from '@babel/types';
import type { TwinRuntimeComponent } from '@native-twin/css/jsx';
import { asArray } from '@native-twin/helpers';
import * as Data from 'effect/Data';
import * as Hash from 'effect/Hash';
import * as Iterable from 'effect/Iterable';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import { type BabelFileAst, babelTemplates } from '../Babel';
import type { TwinFile, TwinPath } from '../FileSystem';
import { literalValueToAst } from '../utils/babel/babel.utils';
import type { TwinJSXElement, TwinJSXElementNode } from './TwinJSXElementNode';

export const TWIN_MODULE_STYLES_OBJECT_VAR_NAME = '_____Twin__Module__Styles';
export const TWIN_STYLESHEET_IMPORT = '__ReactNativeStyleSheet';
export const TWIN_STORE_IMPORT = '__TwinStoreHandler';
export class TwinModuleAst extends Data.Class<{
  readonly ast: BabelFileAst;
  readonly file: TwinFile;
  readonly jsxElements: TwinJSXElement[];
  readonly dependencies: ModuleDependency[];
}> {
  private _registerComponents = t.arrayExpression();

  constructor(data: {
    ast: BabelFileAst;
    file: TwinFile;
    jsxElements: TwinJSXElement[];
    dependencies: ModuleDependency[];
  }) {
    super(data);

    if (this.jsxElements.length > 0) {
      this.ast.program = t.removeComments(this.ast.program);
      t.addComment(this.ast.program, 'inner', ' @ts-noCheck', true);
      this.ast.program.body.unshift(
        babelTemplates.importRNStyleSheet() as t.Statement,
        // createBabelVariable(TWIN_STYLESHEET_IMPORT, createRequireExpression('@native-twin/jsx')),
      );
      this.ast.program.body.unshift(
        babelTemplates.importTwinStore({
          TWIN_STORE_HANDLER_VAR: t.identifier(TWIN_STORE_IMPORT),
        }) as t.Statement,
      );
      this.ast.program.body.push(
        ...asArray(
          babelTemplates.twinStoreRegisterJSX({
            STYLESHEET_VAR_NAME: TWIN_STYLESHEET_IMPORT,
            RUNTIME_COMPONENTS: this._registerComponents,
          }),
        ),
      );
    }
  }

  get id() {
    const { path, basename } = this.file;
    return `${basename}:${Hash.string(path)}`;
  }

  toDependenciesStream() {
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
    return Option.andThen(node.dependency, (dependency) => this.findDependency(dependency));
  }

  registerComponent(jsx: TwinRuntimeComponent) {
    
    this._registerComponents.elements.push(literalValueToAst(jsx));
  }

  addStyleRegistryExp(exp: t.Statement) {
    this.ast.program.body.push(exp);
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
