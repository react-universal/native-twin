import * as t from "@babel/types";
import * as Data from "effect/Data";
import * as Hash from "effect/Hash";
import * as Iterable from "effect/Iterable";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import type { BabelFileAst } from "../Babel";
import type { TwinFile, TwinPath } from "../FileSystem";
import type { TwinEvaluatedSheetEntry } from "../StyleSheet";
import {
  createBabelVariable,
  createRequireExpression,
  literalValueToAst,
} from "../utils/babel/babel.utils";
import type { TwinJSXElement } from "./TwinJSXElement";
import type { TwinJSXElementNode } from "./TwinJSXElementNode";

export class TwinModuleAst extends Data.Class<{
  readonly ast: BabelFileAst;
  readonly file: TwinFile;
  readonly jsxElements: TwinJSXElement[];
  readonly dependencies: ModuleDependency[];
}> {
  private styleObject: t.ObjectExpression;
  private stylesVariable: t.VariableDeclaration;
  constructor(data: {
    ast: BabelFileAst;
    file: TwinFile;
    jsxElements: TwinJSXElement[];
    dependencies: ModuleDependency[];
  }) {
    super(data);
    this.styleObject = t.objectExpression([]);
    this.stylesVariable = createBabelVariable(
      "_____Twin__Module__Styles",
      this.styleObject
    );
    if (this.jsxElements.length > 0) {
      this.ast.program.body.push(
        createBabelVariable(
          "__Twin_StyleSheet_Handler",
          createRequireExpression("@native-twin/jsx")
        )
      );
      this.ast.program.body.push(this.stylesVariable);
    }
  }
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
    return Iterable.findFirst(
      this.jsxElements,
      (x) => dep.exportName === x.meta.name
    );
  }

  getJSXElementFromNode(node: TwinJSXElementNode) {
    return Option.andThen(node.dependency, (dependency) =>
      this.findDependency(dependency)
    );
  }

  registerStyle(node: TwinJSXElementNode, styles: TwinEvaluatedSheetEntry) {
    this.styleObject.properties.push(
      t.objectProperty(
        t.stringLiteral(node.jsxStylesIdent),
        literalValueToAst(styles)
      )
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
    return this.originalSource === "react-native";
  }
}
