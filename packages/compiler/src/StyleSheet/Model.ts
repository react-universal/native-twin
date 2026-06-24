import {
  type CompiledSheetEntry,
  createThemeContext,
  StyleSheetAdapter,
  type ThemeContext,
  type TwinRuntimeContext,
} from '@native-twin/core';
import {
  type AnyStyle,
  getRuleSelectorGroup,
  getRuleSelectorGroups,
  parsedRuleSetToClassNames,
  parsedRuleToClassName,
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
import { asArray } from '@native-twin/helpers';
import * as RA from 'effect/Array';
import * as Data from 'effect/Data';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import type { InternalTwFn, InternalTwinConfig } from '../Config';
import type {
  JSXAttributePath,
  JSXClassPropExpression,
  TwinJSXClassnameProp,
  TwinJSXElementNode,
} from '../internal/babel/babel.models';

export interface TwinPlatformExtractors {
  native: CompilerStyleSheet;
  web: CompilerStyleSheet;
}

export class CompilerStyleSheet extends StyleSheetAdapter<InternalTwinConfig> {
  _twinCtx: ThemeContext;
  // runtimeContext: TwinRuntimeContext;

  get runtimeContext(): TwinRuntimeContext {
    return {} as any;
  }

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
      return classProp.twinRules.flatMap((rule): RuntimeJSXStyle[] => {
        const entry = this._twinCtx.r(rule);

        if (!entry) return [];

        const compiledDecls = entry.declarations.map((x) => compileEntryDeclaration(x, this.ctx));

        return asArray({
          className: parsedRuleToClassName(rule),
          declarations: compiledDecls,
          groups,
          group: mainGroup,
          important: entry.important,
          inherited: false,
          precedence: entry.precedence,
        });
      });
    });

    return {
      classNames: parsedRuleSetToClassNames(classProp.twinRules),
      templateEntries: Option.getOrNull(classProp.expression)?.text ?? null,
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
      const compiledEntries = prop.twinRules.map((x) => this.compileParsedRule(x));

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
  expression: Option.Option<JSXClassPropExpression>;
  target: string;
  prop: string;
  compiledEntries: CompiledSheetEntry[];
}> {
  toRuntime(inherited: boolean, parentStyles: CompiledSheetEntry[] = []): RuntimeTwinMappedProp {
    const entries: RuntimeTwinMappedProp['entries'] = RA.union(
      this.compiledEntries,
      parentStyles,
    ).reduce(
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
      classNames: this.text,
      templateEntries: Option.map(this.expression, (x) => x.text).pipe(Option.getOrElse(() => '')),
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
