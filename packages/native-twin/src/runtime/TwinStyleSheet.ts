import {
  type AnyStyle,
  type CompleteStyle,
  interpolate,
  parsedRuleToClassName,
  parseTWTokens,
  type SheetEntry,
  type SheetEntryDeclaration,
  type TWParsedRule,
} from '@native-twin/css';
import {
  Predicates,
  type RuntimeJSXStyle,
  type RuntimeSheetDeclaration,
  type RuntimeTwinMappedProp,
  SheetOrders,
  type TwinRuntimeComponent,
} from '@native-twin/css/jsx';
import { asArray, keysOf, type MaybeArray } from '@native-twin/helpers';
import type { StyleProp } from 'react-native';
import { parsedRuleToEntry } from '../convert/ruleToEntry';
import { parseCssValue } from '../parsers/values.parser';
import { CompiledSheetEntry } from '../twin/compiler.models';
import type { __Theme__, RuntimeTW } from '../types/theme.types';
import type { TwinRuntimeContext } from './runtime.context';

export type StyleSheetProcessor = (entries: SheetEntry[]) => RuntimeSheetDeclaration[];

const expressionSymbol = Symbol('______Expression__Symbol');
export interface ClassnameStyles {
  base: CompleteStyle & { [expressionSymbol]?: true };
  pointer: CompleteStyle & { [expressionSymbol]?: true };
  dark: CompleteStyle & { [expressionSymbol]?: true };
  group: CompleteStyle & { [expressionSymbol]?: true };
}

export interface ComponentStyleRegistry {
  id: string;
  props: {
    text: string;
    classname: string;
    prop: string;
    target: string;
    styles: ClassnameStyles;
  }[];
}

const EMPTY_STYLES = Object.freeze({});

const emptyComponent: ComponentStyleRegistry = Object.freeze({
  id: '___Null_',
  props: [],
} satisfies ComponentStyleRegistry);

export abstract class TwinComponentsBaseRegistry<Theme extends __Theme__ = __Theme__> {
  private _twinComponents = new Map<string, TwinRuntimeComponent>();
  private _twinStyles = new Map<string, ComponentStyleRegistry>();
  private _runtimeStyles = new Map<string, CompleteStyle>();
  private _classnameStyles = new Map<string, ClassnameStyles>();
  // private injected = new Map<string, string>();
  private _blackListEntries = new Set<string>();

  abstract twinFn: RuntimeTW<Theme>;
  abstract runtimeContext: TwinRuntimeContext;
  abstract toRuntimeDecls(entries: SheetEntry[]): RuntimeSheetDeclaration[];
  abstract toNativeStyles(entries: SheetEntry[]): MaybeArray<CompleteStyle>;
  abstract compileParsedRule(rule: TWParsedRule): CompiledSheetEntry;

  constructor(readonly debug: boolean) {}

  getTwinStyle(
    recordID: string,
    _exp?: { prop: string; target: string; expression: string },
  ): ComponentStyleRegistry {
    if (!this._twinStyles.has(recordID)) {
      return emptyComponent;
    }

    const r = this._twinStyles.get(recordID)!;
    if (_exp) {
      console.debug('EXP: ', _exp);
      r.props = r.props.map((x): ComponentStyleRegistry['props'][number] => {
        if (x.prop === _exp.prop) {
          const tokens = interpolate`${[_exp.expression]}`;
          const extra = parseTWTokens(tokens).map((rule) => this.compileParsedRule(rule));
          const runtimeSheets = this.fromEntries(
            extra.map((x) => x.toRuntime(false)),
            extra.map((x) => parsedRuleToClassName(x.parsed)).join(' '),
          );

          return { ...x, styles: mergeStyleSheets(x.styles, runtimeSheets) };
        }
        return x;
      });
    }
    return r;
  }

  getComponent(id: string) {
    return this._twinComponents.get(id);
  }

  private registerRuntimeComponent(component: TwinRuntimeComponent) {
    if (!this._twinComponents.has(component.id)) {
      this._twinComponents.set(component.id, component);
    }
  }

  private registerStyles(component: TwinRuntimeComponent) {
    if (!this._twinStyles.has(component.id)) {
      const registry: ComponentStyleRegistry = {
        id: component.id,
        props: component.props.map((x) => this.getComponentStylesProp(x)),
      };
      this._twinStyles.set(registry.id, registry);
    }
  }

  registerComponent(data: MaybeArray<TwinRuntimeComponent>) {
    for (const component of asArray(data)) {
      this.registerRuntimeComponent(component);
      this.registerStyles(component);
    }
  }

  private getComponentStylesProp(
    prop: RuntimeTwinMappedProp,
  ): ComponentStyleRegistry['props'][number] {
    const tokens = interpolate`${[prop.templateEntries]}`;
    const extra = parseTWTokens(tokens).map((rule) => this.compileParsedRule(rule));

    const classNames = prop.entries.base
      .map((x) => x.className)
      .concat(extra.map((x) => x.raw.className))
      .join(' ');
    const styles = this.fromEntries(
      [
        ...prop.entries.base,
        ...prop.entries.pointer,
        ...prop.entries.group,
        ...extra.map((x) => x.toRuntime(false)),
      ],
      classNames,
    );
    return {
      classname: classNames,
      text: classNames,
      prop: prop.prop,
      target: prop.target,
      styles,
    };
  }

  getComponentStyledProps(
    id: string,
    withPointer: boolean,
    withGroup: boolean,
  ): { [key: string]: StyleProp<CompleteStyle> } {
    const component = this._twinStyles.get(id);
    if (!component) return EMPTY_STYLES;
    const props = component.props.reduce((prev, current) => {
      const final = { ...current.styles.base };
      if (withPointer) {
        Object.assign(final, current.styles.pointer);
      }
      if (withGroup) {
        Object.assign(final, current.styles.group);
      }
      return Object.assign(
        { ...prev },
        {
          [current.target]: final,
        },
      );
    }, {});
    return props;
  }

  private fromEntries(entries: RuntimeJSXStyle[], className: string): ClassnameStyles {
    if (this._classnameStyles.has(className)) {
      return this._classnameStyles.get(className)!;
    }

    return SheetOrders.sortSheetEntriesArray(entries).reduce(
      (prev, current) => {
        const completeStyle = this.registerEntry(current);
        if (!completeStyle) return prev;

        if (current.groups.some((x) => x === 'pointer')) {
          prev.pointer = mergeStyles(prev.pointer, completeStyle);
          return prev;
        }
        if (current.groups.some((x) => x === 'group')) {
          prev.group = mergeStyles(prev.group, completeStyle);
          return prev;
        }
        if (current.groups.some(Predicates.isDarkSelector)) {
          prev.dark = mergeStyles(prev.dark, completeStyle);
          return prev;
        }

        prev.base = mergeStyles(prev.base, completeStyle);

        return prev;
      },
      { base: {}, pointer: {}, dark: {}, group: {} } as ClassnameStyles,
    );
  }

  private registerEntry(entry: RuntimeJSXStyle) {
    if (this._blackListEntries.has(entry.className)) return null;

    if (this._runtimeStyles.has(entry.className)) {
      return this._runtimeStyles.get(entry.className) ?? null;
    }

    const styles = composeDeclarations(entry.declarations, this.runtimeContext);

    if (!styles) {
      this._blackListEntries.add(entry.className);
      return null;
    }

    this._runtimeStyles.set(entry.className, styles);
    return styles;
  }

  // getTwinRegistryKey(data: TwinRuntimeComponent) {
  //   const classnames = data.props.map((x) => x.target).join(' ');
  //   const entries = data.props.map((x) => x.classNames).join(' ');
  //   return hash(`${data.id}-${data.index}-${data.parentSize}-${classnames}-${entries}`);
  // }

  // remove(_injectionID: string) {
  //   // const data = this.injected.get(injectionID);
  //   // if (data) {
  //   //   this.injected.delete(injectionID);
  //   //   this._twinComponents.delete(data);
  //   //   if (this.debug) {
  //   //     console.debug('StyleSheet: deleted record', data);
  //   //   }
  //   // }
  // }

  reset() {
    // this.injected.clear();
    this._twinComponents.clear();
  }
}

export abstract class StyleSheetAdapter<
  Theme extends __Theme__ = __Theme__,
> extends TwinComponentsBaseRegistry<Theme> {
  private _ruleRegistry = new Map<string, CompiledSheetEntry>();

  get target() {
    return this.twinFn.target;
  }

  constructor(debug: boolean) {
    super(debug);
  }

  compileParsedRule(rule: TWParsedRule): CompiledSheetEntry {
    const hash = parsedRuleToClassName(rule);
    if (this._ruleRegistry.has(hash)) {
      return this._ruleRegistry.get(hash)!;
    }
    const entry = parsedRuleToEntry(rule, this.twinFn.context);
    const decls = this.toRuntimeDecls(asArray(entry));
    return new CompiledSheetEntry({ decls, parsed: rule, raw: entry });
  }

  // private getRuleID(rule: TWParsedRule) {
  //   return stableHash(rule, this.debug);
  // }
}

const mergeStyles = (self: CompleteStyle, that: CompleteStyle): CompleteStyle => {
  for (const key of keysOf(that)) {
    if (key === 'transform') {
      const current = self[key];
      const thatValue = that[key];
      if (!Array.isArray(current) || !Array.isArray(thatValue)) continue;
      if (current) {
        const newValue = current.concat(thatValue);
        Object.assign({}, { ...self }, { [key]: newValue });
      }
    }
  }

  const result = Object.assign({}, { ...self }, { ...that });
  return result;
};

function mergeStyleSheets(self: ClassnameStyles, that: ClassnameStyles): ClassnameStyles {
  return {
    base: mergeStyles(self.base, that.base),
    dark: mergeStyles(self.dark, that.dark),
    group: mergeStyles(self.group, that.group),
    pointer: mergeStyles(self.pointer, that.pointer),
  };
}

function composeDeclarations(decls: RuntimeSheetDeclaration[], ctx: TwinRuntimeContext) {
  const styledCtx = {
    rem: ctx.units.rem,
    deviceHeight: ctx.deviceHeight,
    deviceWidth: ctx.deviceWidth,
  };
  return decls.reduce((prev, current) => {
    if (current._tag === 'COMPILED') {
      if (typeof current.value === 'number' || typeof current.value === 'string') {
        Object.assign(prev, { [current.prop]: current.value });
        return prev;
      }
      if (Array.isArray(current.value)) {
        // TODO: fix deep concat
        Object.assign(prev, {
          [current.prop]: composeDeclValueArray(current.value),
        });
        return prev;
      }
      Object.assign(prev, current.value);
      return prev;
    }

    let value: any = current.value;
    if (Array.isArray(current.value)) {
      value = [];
      for (const t of current.value) {
        if (typeof t.value === 'string') {
          if (t.value) {
            value.push({
              [t.prop]: parseCssValue(t.prop, t.value, styledCtx),
            });
          }
        }
      }
      Object.assign(prev, {
        transform: [...(prev['transform'] ?? []), ...value],
      });
      return prev;
    }
    if (typeof value === 'string') {
      value = parseCssValue(current.prop, value, styledCtx);
    }
    if (typeof value === 'object') {
      Object.assign(prev, value);
    } else {
      Object.assign(prev, { [current.prop]: value });
    }

    return prev;
  }, {} as AnyStyle);
}

function composeDeclValueArray(
  value: SheetEntryDeclaration['value'],
): AnyStyle[] | string | number | AnyStyle {
  if (typeof value === 'number' || typeof value === 'number') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((val) => {
      return { [val.prop]: composeDeclValueArray(val.value) };
    });
  }

  return value;
}
