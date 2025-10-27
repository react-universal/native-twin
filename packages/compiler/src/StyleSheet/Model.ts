import {
  CompiledSheetEntry,
  createThemeContext,
  parsedRuleToEntry,
  StyleSheetAdapter,
  type ThemeContext,
} from '@native-twin/core';
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
} from '@native-twin/css/jsx';
import * as RA from 'effect/Array';
import * as Data from 'effect/Data';
import { pipe } from 'effect/Function';
import type * as Option from 'effect/Option';
import type { JSXAttributePath } from '../Babel';
import type { InternalTwFn, InternalTwinConfig } from '../Config';
import type { TwinJSXClassnameProp } from '../Domain/JSXStyledProp';
import type { TwinJSXElementNode } from '../Domain/TwinJSXElementNode';

export class CompilerStyleSheet extends StyleSheetAdapter<InternalTwinConfig> {
  _twinCtx: ThemeContext;
  constructor(
    readonly ctx: CompilerContext,
    readonly twinFn: InternalTwFn,
    debug: boolean,
  ) {
    super(debug);
    this._twinCtx = createThemeContext(twinFn.config);
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
      entries: {
        base: runtimeStyles.filter((x) => x.group === 'base'),
        child: runtimeStyles.filter((x) => x.groups.some(Predicates.isChildSelector)),
        pointer: runtimeStyles.filter((x) => x.groups.some((y) => Predicates.isPointerSelector(y))),
        group: runtimeStyles.filter((x) => x.groups.some((y) => Predicates.isGroupSelector(y))),
      },
      prop: classProp.prop,
      target: classProp.target,
      metadata: {
        hasGroupEvents: classProp.twinRules.some((x) => x.v.some(Predicates.isGroupSelector)),
        hasPointerEvents: classProp.twinRules.some((x) => x.v.some(Predicates.isPointerSelector)),
        isGroupParent: classProp.twinRules.some((x) => x.n === 'group'),
      },
    };
  }

  getStyledProps(node: TwinJSXElementNode): CompiledStyledProp[] {
    return node.classNameProps.map((prop) => {
      const compiledEntries = prop.twinRules.map((x) => {
        const entry = parsedRuleToEntry(x, this._twinCtx);
        const decls = entry.declarations.map((x) => compileEntryDeclaration(x, this.ctx));
        return new CompiledSheetEntry({ decls, raw: entry, parsed: x });
      });

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

export class CompiledStyledProp extends Data.Class<{
  ast: JSXAttributePath;
  text: string;
  expression: Option.Option<string>;
  target: string;
  prop: string;
  compiledEntries: CompiledSheetEntry[];
}> {
  toRuntime(inherited: boolean): RuntimeTwinMappedProp {
    const entries: RuntimeTwinMappedProp['entries'] = this.compiledEntries.reduce(
      (prev, current) => {
        if (current.isChildEntry) {
          prev.child.push(current.toRuntime(inherited));
          return prev;
        }
        if (current.isGroupSelector) {
          prev.group.push(current.toRuntime(false));
          return prev;
        }
        if (current.isPointerEntry) {
          prev.pointer.push(current.toRuntime(false));
          return prev;
        }
        prev.base.push(current.toRuntime(false));
        return prev;
      },
      {
        base: [],
        child: [],
        pointer: [],
        group: [],
      } as RuntimeTwinMappedProp['entries'],
    );
    return {
      entries,
      prop: this.prop,
      target: this.target,
      metadata: {
        hasGroupEvents: entries.group.length > 0,
        hasPointerEvents: entries.pointer.length > 0,
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
