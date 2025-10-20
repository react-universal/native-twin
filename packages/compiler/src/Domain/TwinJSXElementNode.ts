import * as Hash from "effect/Hash";
import { Data } from "effect/index";
import * as Option from "effect/Option";
import type { JSXElementPath } from "../Babel";
import type { TwinFile } from "../FileSystem";
import type { MappedComponent } from "../utils/constants";
import type { TwinJSXClassnameProp } from "./JSXStyledProp";
import type { ModuleDependency } from "./TwinAst";

export class TwinJSXElementNode extends Data.Class<{
  readonly mappedProps: MappedComponent;
  readonly classNameProps: TwinJSXClassnameProp[];
  readonly file: TwinFile;
  readonly babelPath: JSXElementPath;
  readonly name: string;
  readonly dependency: Option.Option<ModuleDependency>;
}> {
  get id() {
    const dep = this.dependency.pipe(
      Option.map(
        (x) =>
          `${x.filepath}_${x.localName}_${x.originalSource}_${x.exportName}`
      ),
      Option.getOrElse(() => "NoDep"),
      Hash.string
    );
    return `__JSXElementNode:${Hash.string(this.file.path)}:${dep}:${
      this.name
    }`;
  }
  get jsxStylesIdent() {
    return this.id.replace(/:/g, "_");
    // return `__JSXElementStyles_${(this as any)[Hash.symbol]()}_${this.name}`;
  }
  get hasExpressions() {
    return this.classNameProps.some((x) => x.hasExpression);
  }

  // [Hash.symbol](): number {
  //   return Hash.structure({
  //     loc: this.babelPath.node.loc,
  //     range: [this.babelPath.node.start, this.babelPath.node.end],
  //   });
  // }

  // [Equal.symbol](that: unknown): boolean {
  //   return that instanceof TwinJSXElementNode && this[Hash.symbol]() === that[Hash.symbol]();
  // }
}
