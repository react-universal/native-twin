import * as SemiGroup from "@effect/typeclass/Semigroup";
import type {
  AnyStyle,
  CompleteStyle,
  SheetEntryDeclaration,
} from "@native-twin/css";
import {
  Predicates,
  type RuntimeJSXStyle,
  type RuntimeSheetDeclaration,
  type RuntimeTwinMappedProp,
  SheetOrders,
  type TwinRuntimeComponent,
} from "@native-twin/css/jsx";
import { keysOf } from "@native-twin/helpers";
import { StyleSheet as NativeSheet, type StyleProp } from "react-native";
import { INTERNAL_RESET } from "../utils/constants";
import { styledContext } from "./observables";

export interface ClassnameStyles {
  base: CompleteStyle;
  pointer: CompleteStyle;
  dark: CompleteStyle;
}

export interface ComponentStyleRegistry {
  id: string;
  props: {
    classname: string;
    prop: string;
    target: string;
    styles: ClassnameStyles;
  }[];
}

export class TwinStyledSheetManager {
  private _registry = new Map<string, ComponentStyleRegistry>();
  private _runtimeStyles = new Map<string, CompleteStyle>();
  private _blackListEntries = new Set<string>();
  private _classnameStyles = new Map<string, ClassnameStyles>();
  create = NativeSheet.create;
  flatten = NativeSheet.flatten;
  compose = NativeSheet.compose;
  absoluteFill = NativeSheet.absoluteFill;
  absoluteFillObject = NativeSheet.absoluteFillObject;
  hairlineWidth = NativeSheet.hairlineWidth;

  get readStyledContext() {
    return styledContext.get();
  }

  registerComponent(component: TwinRuntimeComponent) {
    if (this._registry.has(component.id)) {
      return this._registry.get(component.id)!;
    }
    const registry: ComponentStyleRegistry = {
      id: component.id,
      props: component.props.map((x) => this.getComponentStylesProp(x)),
    };
    this._registry.set(registry.id, registry);
    return registry;
  }

  getComponentStyles(
    id: string,
    prop: string,
    withPointer: boolean
  ): StyleProp<CompleteStyle> {
    const component = this._registry.get(id);
    if (!component) return {};
    const styledProp = component.props.find((x) => x.prop === prop);
    if (!styledProp) return {};
    const base = stylesSemiGroup.combine(
      styledProp.styles.base,
      this.readStyledContext.colorScheme === "dark"
        ? styledProp.styles.dark
        : {}
    );
    if (withPointer) return this.flatten([base, styledProp.styles.pointer]);
    return base;
  }

  [INTERNAL_RESET]() {
    this._runtimeStyles.clear();
    this._registry.clear();
    this._blackListEntries.clear();
    this._classnameStyles.clear();
  }

  private getComponentStylesProp(
    prop: RuntimeTwinMappedProp
  ): ComponentStyleRegistry["props"][number] {
    const classNames = prop.entries.map((x) => x.className).join(" ");
    const styles = this.fromEntries(prop.entries, classNames);
    return {
      classname: classNames,
      prop: prop.prop,
      target: prop.target,
      styles,
    };
  }

  private fromEntries(
    entries: RuntimeJSXStyle[],
    className: string
  ): ClassnameStyles {
    if (this._classnameStyles.has(className)) {
      return this._classnameStyles.get(className)!;
    }

    return SheetOrders.sortSheetEntriesArray(entries).reduce(
      (prev, current) => {
        const completeStyle = this.registerEntry(current);
        if (!completeStyle) return prev;
        if (
          current.groups.some(
            (x) =>
              Predicates.isPointerSelector(x) || Predicates.isGroupSelector(x)
          )
        ) {
          prev.pointer = stylesSemiGroup.combine(prev.pointer, completeStyle);
          return prev;
        }
        if (current.groups.some(Predicates.isDarkSelector)) {
          prev.dark = stylesSemiGroup.combine(prev.dark, completeStyle);
          return prev;
        }

        prev.base = stylesSemiGroup.combine(prev.base, completeStyle);

        return prev;
      },
      { base: {}, pointer: {}, dark: {} } as ClassnameStyles
    );
  }

  private registerEntry(entry: RuntimeJSXStyle) {
    if (this._blackListEntries.has(entry.className)) return null;

    if (this._runtimeStyles.has(entry.className)) {
      return this._runtimeStyles.get(entry.className) ?? null;
    }

    const styles = composeDeclarations(entry.declarations);

    if (!styles) {
      this._blackListEntries.add(entry.className);
      return null;
    }

    this._runtimeStyles.set(entry.className, styles);
    return styles;
  }
}

export const TwinStyleSheet = new TwinStyledSheetManager();

const stylesSemiGroup = SemiGroup.make<CompleteStyle>((self, that) => {
  for (const key of keysOf(that)) {
    if (key === "transform") {
      const current = self[key];
      const thatValue = that[key];
      if (!Array.isArray(current) || !Array.isArray(thatValue)) continue;
      if (current) {
        const newValue = current.concat(thatValue);
        Object.assign({}, { ...self }, { [key]: newValue });
      }
    }
  }

  return Object.assign({}, { ...self }, that);
});

function composeDeclarations(decls: RuntimeSheetDeclaration[]) {
  return decls.reduce((prev, current) => {
    if (current._tag === "COMPILED") {
      if (
        typeof current.value === "number" ||
        typeof current.value === "string"
      ) {
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
    return prev;
  }, {} as AnyStyle);
}

function composeDeclValueArray(
  value: SheetEntryDeclaration["value"]
): AnyStyle[] | string | number | AnyStyle {
  if (typeof value === "number" || typeof value === "number") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((val) => {
      return { [val.prop]: composeDeclValueArray(val.value) };
    });
  }

  return value;
}
