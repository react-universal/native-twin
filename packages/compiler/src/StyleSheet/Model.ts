import { StyleSheetAdapter } from '@native-twin/core';
import {
  type AnyStyle,
  getRuleSelectorGroup,
  getRuleSelectorGroups,
  type SheetEntry,
} from '@native-twin/css';
import {
  type CompilerContext,
  compileEntryDeclaration,
  mergeCompiledDeclarations,
  Predicates,
  type RuntimeJSXStyle,
  type RuntimeSheetDeclaration,
  type RuntimeTwinMappedProp,
  type TwinRuntimeComponent,
} from '@native-twin/css/jsx';
import type { TreeNode } from '@native-twin/helpers/tree';
import * as RA from 'effect/Array';
// import * as RA from 'effect/Array';
import * as Data from 'effect/Data';
import { pipe } from 'effect/Function';
import type * as Option from 'effect/Option';
import type { JSXAttributePath } from '../Babel';
import type { InternalTwFn, InternalTwinConfig } from '../Config';
import type { TwinJSXClassnameProp } from '../Domain/JSXStyledProp';
import type { TwinJSXElementNode } from '../Domain/TwinJSXElementNode';

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

export interface TwinEvaluatedStyle {
  styles: TwinEvaluatedSheetEntry;
  prop: CompiledStyledProp | null;
  node: TwinJSXElementNode;
}

export class CompilerStyleSheet extends StyleSheetAdapter<InternalTwinConfig> {
  constructor(
    readonly ctx: CompilerContext,
    readonly twinFn: InternalTwFn,
    debug: boolean,
  ) {
    super(debug);
    
  }

  toRuntimeDecls(entries: SheetEntry[]): RuntimeSheetDeclaration[] {
    return entries.flatMap((x) => x.declarations).map((x) => compileEntryDeclaration(x, this.ctx));
  }

  toNativeStyles(entries: SheetEntry[]): AnyStyle {
    const declarations = this.toRuntimeDecls(entries);
    return mergeCompiledDeclarations(declarations);
  }

  getCompiledClassProp(classProp: TwinJSXClassnameProp): RuntimeTwinMappedProp {
    const runtimeStyles = classProp.twinRules.flatMap((x) => {
      const groups = getRuleSelectorGroups(x.v);
      const mainGroup = getRuleSelectorGroup(groups);
      const sheetEntries = this.twinFn(x.n);
      return sheetEntries.map((entry): RuntimeJSXStyle => {
        const compiledDecls = entry.declarations.map((x) => compileEntryDeclaration(x, this.ctx));

        return {
          className: entry.className,
          declarations: compiledDecls,
          groups,
          group: mainGroup,
          important: entry.important,
          inherited: false,
          precedence: entry.precedence,
        };
      });
    });

    return {
      entries: runtimeStyles,
      prop: classProp.prop,
      target: classProp.target,
      metadata: {
        hasGroupEvents: classProp.twinRules.some((x) => x.v.some(Predicates.isGroupSelector)),
        hasPointerEvents: classProp.twinRules.some((x) => x.v.some(Predicates.isPointerSelector)),
        isGroupParent: classProp.twinRules.some((x) => x.n === 'group'),
      },
    };
  }

  getRuntimeComponent(node: TreeNode<TwinJSXElementNode>): TwinRuntimeComponent {
    const styledProps = node.value.classNameProps.map((prop) => this.getCompiledClassProp(prop));
    const childStyles = styledProps
      .flatMap((x) => x.entries)
      .filter((x) => x.groups.some(Predicates.isChildSelector));
    return {
      childStyles,
      id: node.value.id,
      index: node.nodeIndex,
      parentSize: node.parent?.childrenCount ?? -1,
      props: styledProps,
      parentID: node.parent?.value.id ?? null,
      metadata: {
        hasGroupEvents: styledProps.some((x) => x.metadata.hasGroupEvents),
        hasPointerEvents: styledProps.some((x) => x.metadata.hasPointerEvents),
        isGroupParent: styledProps.some((x) => x.metadata.isGroupParent),
      },
    };
  }
  getStyledProps(node: TwinJSXElementNode): CompiledStyledProp[] {
    return node.classNameProps.map((prop) => {
      const entries = this.twinFn(prop.text);
      const compiledEntries = entries.map(
        (entry) =>
          new CompiledSheetEntry({
            decls: entry.declarations.map((decl) => compileEntryDeclaration(decl, this.ctx)),
            raw: entry,
          }),
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
  toRuntime(inherited: boolean): RuntimeJSXStyle {
    return {
      className: this.raw.className,
      important: this.raw.important,
      inherited,
      precedence: this.raw.precedence,
      group: this.mainSelectorGroup,
      groups: this.selectorGroups,
      declarations: this.decls,
    };
  }
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
    return this.raw.className === 'group';
  }
  get isBaseEntry() {
    return this.mainSelectorGroup === 'base' || this.selectorGroups.length === 0;
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
  toRuntime(inherited: boolean): RuntimeTwinMappedProp {
    return {
      entries: this.compiledEntries.map((entry) => entry.toRuntime(inherited)),
      prop: this.prop,
      target: this.target,
      metadata: {
        hasGroupEvents: this.groupStyles.length > 0,
        hasPointerEvents: this.pointerStyles.length > 0,
        isGroupParent: this.compiledEntries.some((x) => x.raw.className === 'group'),
      },
    };
  }

  get ownStyles(): CompiledSheetEntry[] {
    return pipe(
      RA.appendAll(this.baseStyles)(this.darkStyles),
      RA.appendAll(this.pointerStyles),
      RA.appendAll(this.groupStyles),
    );
  }
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

  get isGroupParent() {
    return this.compiledEntries.some((x) => x.raw.className === 'group');
  }

  getChildStyles(ord: number, parentSize: number) {
    const result: CompiledSheetEntry[] = [];
    for (const childStyle of this.childStyles) {
      const selector = childStyle.mainSelectorGroup;
      if (ord === 0 && selector === 'first') result.push(childStyle);
      if (ord === parentSize - 1 && selector === 'last') result.push(childStyle);
      if ((ord + 1) % 2 === 0 && selector === 'even') result.push(childStyle);
      if ((ord + 1) % 2 !== 0 && selector === 'odd') result.push(childStyle);
    }
    return result;
  }
}
