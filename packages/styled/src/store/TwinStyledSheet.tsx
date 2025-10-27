import * as SemiGroup from "@effect/typeclass/Semigroup";
import {
  type AnyStyle,
  type CompleteStyle,
  getRuleSelectorGroup,
  getRuleSelectorGroups,
  type SheetEntry,
  type SheetEntryDeclaration,
} from "@native-twin/css";
import {
  compileEntryDeclaration,
  Predicates,
  type RuntimeJSXStyle,
  type RuntimeSheetDeclaration,
  type RuntimeTwinMappedProp,
  SheetOrders,
  type TwinRuntimeComponent,
} from "@native-twin/css/jsx";
import { keysOf } from "@native-twin/helpers";
import {
  StyleSheet as NativeSheet,
  Platform,
  type StyleProp,
} from "react-native";
import { INTERNAL_RESET } from "../utils/constants";
import { styledContext } from "./observables";

export interface ClassnameStyles {
  base: CompleteStyle;
  pointer: CompleteStyle;
  dark: CompleteStyle;
  group: CompleteStyle;
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

const EMPTY_STYLES = Object.freeze({});

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

  getComponentStyledProps(
    id: string,
    withPointer: boolean,
    withGroup: boolean
  ): {
    [key: string]: StyleProp<CompleteStyle>;
  } {
    const component = this._registry.get(id);
    if (!component) return EMPTY_STYLES;
    if (withGroup) {
      console.log("withGroup: ", {
        id,
        withPointer,
        withGroup,
        component,
      });
    }
    return component.props.reduce((prev, current) => {
      const final = { ...current.styles.base };
      if (withPointer) {
        Object.assign(final, current.styles.pointer);
      }
      if (withGroup) {
        Object.assign(final, current.styles.group);
        console.log("asdasdasd", withPointer, current);
      }
      return Object.assign(
        { ...prev },
        {
          [current.target]: final,
        }
      );
    }, {});
  }

  getComponentStyles(
    id: string,
    prop: string,
    withPointer: boolean
  ): StyleProp<CompleteStyle> {
    const component = this._registry.get(id);
    if (!component) return EMPTY_STYLES;

    const styledProp = component.props.find((x) => x.prop === prop);

    if (!styledProp) return EMPTY_STYLES;

    const base = stylesSemiGroup.combine(
      styledProp.styles.base,
      this.readStyledContext.colorScheme === "dark"
        ? styledProp.styles.dark
        : EMPTY_STYLES
    );
    if (withPointer) return this.flatten([base, styledProp.styles.pointer]);
    return base;
  }

  evaluateSheetEntry(entry: SheetEntry): RuntimeJSXStyle {
    return {
      className: entry.className,
      group: getRuleSelectorGroup(entry.selectors),
      groups: getRuleSelectorGroups(entry.selectors),
      important: entry.important,
      inherited: false,
      precedence: entry.precedence,
      declarations: entry.declarations.map((x) =>
        compileEntryDeclaration(x, {
          baseRem: this.readStyledContext.units.rem,
          platform: Platform.OS,
        })
      ),
    };
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
    const classNames = prop.entries.base.map((x) => x.className).join(" ");
    const styles = this.fromEntries(
      [...prop.entries.base, ...prop.entries.pointer, ...prop.entries.group],
      classNames
    );
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
        if (current.groups.some((x) => x === "pointer")) {
          prev.pointer = stylesSemiGroup.combine(prev.pointer, completeStyle);
          return prev;
        }
        if (current.groups.some((x) => x === "group")) {
          prev.group = stylesSemiGroup.combine(prev.group, completeStyle);
          return prev;
        }
        if (current.groups.some(Predicates.isDarkSelector)) {
          prev.dark = stylesSemiGroup.combine(prev.dark, completeStyle);
          return prev;
        }

        prev.base = stylesSemiGroup.combine(prev.base, completeStyle);

        return prev;
      },
      { base: {}, pointer: {}, dark: {}, group: {} } as ClassnameStyles
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

  const result = Object.assign({}, { ...self }, { ...that });
  return result;
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
