import { StyleSheetAdapter } from "@native-twin/core";
import {
  type AnyStyle,
  getRuleSelectorGroup,
  getRuleSelectorGroups,
  type SheetEntry,
} from "@native-twin/css";
import {
  type CompilerContext,
  compileEntryDeclaration,
  mergeCompiledDeclarations,
  Predicates,
  type RuntimeSheetDeclaration,
} from "@native-twin/css/jsx";
// import * as RA from 'effect/Array';
import * as Data from "effect/Data";
import type * as Option from "effect/Option";
import type { JSXAttributePath } from "../Babel";
import type { InternalTwFn, InternalTwinConfig } from "../Config";
import type { TwinJSXElementNode } from "../Domain/TwinJSXElementNode";

export interface TwinEvaluatedEntryDecls {
  styles: AnyStyle;
  rawDecls: RuntimeSheetDeclaration[];
}
export interface TwinEvaluatedSheetEntry {
  base: TwinEvaluatedEntryDecls;
  child: {
    first: TwinEvaluatedEntryDecls;
    last: TwinEvaluatedEntryDecls;
    even: TwinEvaluatedEntryDecls;
    odd: TwinEvaluatedEntryDecls;
  };
  pointer: TwinEvaluatedEntryDecls;
  group: TwinEvaluatedEntryDecls;
  dark: TwinEvaluatedEntryDecls;
  isGroupParent: boolean;
}

// export class CompilerJSXElementNode extends Data.Class<{
//   ast: TwinJSXElementNode;
//   styledProps: CompiledStyledProp[];
//   compiledProps: CompiledStyledProp[];
//   importSource: Option.Option<TwinJSXElement>;
// }> {
//   get stylesIdent() {
//     return this.ast.babelPath;
//   }
// }

// export class TwinJSXInjectInfo extends Data.Class<{
//   sheetID: string;
//   hasExpressions: boolean;
//   isExternal: boolean;
//   node: TwinJSXElementNode;
//   isNative: boolean;
// }> {}

export class CompilerStyleSheet extends StyleSheetAdapter<InternalTwinConfig> {
  constructor(
    readonly ctx: CompilerContext,
    readonly twinFn: InternalTwFn,
    debug: boolean
  ) {
    super(debug);
  }

  toRuntimeDecls(entries: SheetEntry[]): RuntimeSheetDeclaration[] {
    return entries
      .flatMap((x) => x.declarations)
      .map((x) => compileEntryDeclaration(x, this.ctx));
  }

  toNativeStyles(entries: SheetEntry[]): AnyStyle {
    const declarations = this.toRuntimeDecls(entries);
    return mergeCompiledDeclarations(declarations);
  }
  getStyledProps(node: TwinJSXElementNode): CompiledStyledProp[] {
    return node.classNameProps.map((prop) => {
      const entries = this.twinFn(prop.text);
      const compiledEntries = entries.map(
        (entry) =>
          new CompiledSheetEntry({
            decls: entry.declarations.map((decl) =>
              compileEntryDeclaration(decl, this.ctx)
            ),
            raw: entry,
          })
      );
      return new CompiledStyledProp({
        ast: prop.ast,
        compiledEntries,
        // compilerEntries: entries.map((x) => new CompilerSheetEntry(x)),
        expression: prop.expression,
        prop: prop.prop,
        target: prop.target,
        text: prop.text,
      });
    });
  }
}

export class CompiledSheetEntry extends Data.Class<{
  raw: SheetEntry;
  decls: RuntimeSheetDeclaration[];
}> {
  get selectorGroups() {
    return getRuleSelectorGroups(this.raw.selectors);
  }
  get mainSelectorGroup() {
    return getRuleSelectorGroup(this.selectorGroups);
  }
  get isChildEntry() {
    return this.selectorGroups.some(Predicates.isChildSelector);
  }
  get isPointerEntry() {
    return this.selectorGroups.some(Predicates.isPointerSelector);
  }
  get isGroupSelector() {
    return this.selectorGroups.some(Predicates.isGroupSelector);
  }
  get isGroupParent() {
    return this.raw.className === "group";
  }
  get isBaseEntry() {
    return (
      this.mainSelectorGroup === "base" || this.selectorGroups.length === 0
    );
  }

  get isDarkEntry() {
    return this.selectorGroups.some(Predicates.isDarkSelector);
  }

  get styles() {
    return mergeCompiledDeclarations(this.decls);
  }
}

export const getEmptyEvaluatedEntry = (): TwinEvaluatedSheetEntry => ({
  base: { rawDecls: [], styles: {} },
  child: {
    even: { rawDecls: [], styles: {} },
    first: { rawDecls: [], styles: {} },
    last: { rawDecls: [], styles: {} },
    odd: { rawDecls: [], styles: {} },
  },
  dark: { rawDecls: [], styles: {} },
  group: { rawDecls: [], styles: {} },
  pointer: { rawDecls: [], styles: {} },
  isGroupParent: false,
});

export class CompiledStyledProp extends Data.Class<{
  ast: JSXAttributePath;
  text: string;
  // compilerEntries: CompilerSheetEntry[];
  expression: Option.Option<string>;
  target: string;
  prop: string;
  compiledEntries: CompiledSheetEntry[];
}> {
  get baseStyles() {
    return this.compiledEntries.filter((x) => x.isBaseEntry);
  }

  get darkStyles() {
    return this.compiledEntries.filter((x) => x.isDarkEntry);
  }

  get childStyles() {
    return this.compiledEntries.filter((x) => x.isChildEntry);
  }

  get pointerStyles() {
    return this.compiledEntries.filter((x) => x.isPointerEntry);
  }
  get groupStyles() {
    return this.compiledEntries.filter((x) => x.isGroupSelector);
  }

  getChildStyles(ord: number, parentSize: number) {
    const result: CompiledSheetEntry[] = [];
    for (const childStyle of this.childStyles) {
      const selector = childStyle.mainSelectorGroup;
      if (ord === 0 && selector === "first") result.push(childStyle);
      if (ord === parentSize - 1 && selector === "last")
        result.push(childStyle);
      if ((ord + 1) % 2 === 0 && selector === "even") result.push(childStyle);
      if ((ord + 1) % 2 !== 0 && selector === "odd") result.push(childStyle);
    }
    return result;
  }
}
// export class TwinJSXNodeStyledProp extends Data.Class<{
//   ast: JSXAttributePath;
//   text: string;
//   compilerEntries: CompilerSheetEntry[];
//   expression: Option.Option<string>;
//   target: string;
//   prop: string;
// }> {
//   get jsxAttributeName() {
//     return t.jsxIdentifier(this.target);
//   }
// }

// export class CompilerSheetEntry {
//   constructor(readonly entry: SheetEntry) {}

//   get declarations() {
//     return this.entry.declarations.map((decl) => new CompilerRuleDeclaration(decl));
//   }

//   get eval() {
//     return this.declarations.map((x) => evalRuleDeclaration(x));
//   }
// }

// export class CompilerRuleDeclaration {
//   readonly parsed: TwinDecl.AnyDeclaration;
//   private readonly _parsedValue: ReturnType<
//     typeof TwinDecl.parseDeclarationValue
//   >;
//   get kind() {
//     return this.parsed._tag;
//   }
//   get hyphenized() {
//     return this.parsed.hyphenized;
//   }
//   get declValue() {
//     if (this._parsedValue.isError) {
//       return {
//         _tag: "raw",
//         value: this.parsed.value,
//       } as const;
//     }
//     return this._parsedValue.result;
//   }

//   constructor(raw: SheetEntryDeclaration) {
//     this.parsed = TwinDecl.fromSheetEntryDecl(raw);
//     this._parsedValue = TwinDecl.parseDeclarationValue(this.parsed);
//   }
// }

// export const evalRuleDeclaration = (decl: CompilerRuleDeclaration) => {
//   const { declValue } = decl;
//   if (declValue._tag === 'raw') {
//     console.log('UN_COMPILED: ', declValue.value);
//     return;
//   }
//   if (declValue._tag === 'flex') {
//     if (declValue.value._tag === 'StyleStringValue') {
//       return declValue.value.value;
//     }
//     return declValue.value.value;
//   }
//   if (declValue._tag === 'dimension') {
//     return [declValue.value, declValue.unit];
//   }
//   if (declValue._tag === 'unitless') {
//     return declValue.value;
//   }
//   if (declValue._tag === 'color') {
//     return declValue.value;
//   }
//   if (declValue._tag === 'literal') {
//     return declValue.raw;
//   }
//   if (declValue._tag === 'transform') {
//     console.log('TRANSFORM: ', declValue);
//     return declValue.value;
//   }
// };
