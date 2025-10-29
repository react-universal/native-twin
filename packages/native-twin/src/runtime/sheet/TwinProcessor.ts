import type { AnyStyle, CompleteStyle } from '@native-twin/css';
import {
  Predicates,
  type RuntimeJSXStyle,
  type RuntimeSheetDeclaration,
  type RuntimeTwinMappedProp,
  SheetOrders,
  type TwinRuntimeComponent,
} from '@native-twin/css/jsx';
import { asArray } from '@native-twin/helpers';
import { parseCssValue } from '../../parsers/values.parser';
import type { TwinRuntimeContext } from '../runtime.context';
import type { ClassnameStyles, ComponentStyleRegistry, TwinComponentStyleProp } from './Models';
import { composeDeclValueArray, createMapRegistry, mergeStyles } from './utils';

export class NativeTwinProcessor {
  private _componentStyles = createMapRegistry<ComponentStyleRegistry>();
  runtimeStyles = createMapRegistry<CompleteStyle>();
  classnameStyles = createMapRegistry<ClassnameStyles>();
  blackListEntries = new Set<string>();

  getStyleRegistry(id: string) {
    return this._componentStyles.get(id);
  }

  runtimeDeclToNative(runtimeDecl: RuntimeSheetDeclaration, ctx: TwinRuntimeContext) {
    return this.getSheetDeclStyles(runtimeDecl, ctx);
  }

  runtimeMappedPropToStyleProp(
    prop: RuntimeTwinMappedProp,
    ctx: TwinRuntimeContext,
  ): TwinComponentStyleProp {
    return {
      classname: prop.classNames,
      prop: prop.prop,
      target: prop.target,
      text: prop.classNames,
      styles: this.runtimeMappedPropToClassStyles(prop, ctx),
      expression: null,
    };
  }

  runtimeMappedPropToClassStyles(
    prop: RuntimeTwinMappedProp,
    ctx: TwinRuntimeContext,
  ): ClassnameStyles {
    const entries = Object.values(prop.entries).flat();
    return SheetOrders.sortSheetEntriesArray(entries).reduce(
      (prev, current) => {
        const completeStyle = this.runtimeStyleToNative(current, ctx);
        if (!completeStyle) return prev;

        if (current.groups.some((x) => x === 'pointer')) {
          // console.log('POINTWR: ', completeStyle);
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

        if (current.groups.some(Predicates.isChildSelector)) {
          return prev;
        }

        prev.base = mergeStyles(prev.base, completeStyle);

        return prev;
      },
      { base: {}, pointer: {}, dark: {}, group: {} } as ClassnameStyles,
    );
  }

  runtimeStyleToNative(runtimeStyle: RuntimeJSXStyle, ctx: TwinRuntimeContext) {
    return runtimeStyle.declarations.reduce((prev, current) => {
      return mergeStyles(prev, this.getSheetDeclStyles(current, ctx));
    }, {} as AnyStyle);
  }

  runtimeComponentToRegistry(
    comp: TwinRuntimeComponent,
    ctx: TwinRuntimeContext,
  ): ComponentStyleRegistry {
    const cached = this._componentStyles.get(comp.id);
    if (cached) return cached;
    const styleRegistry = {
      id: comp.id,
      readClassProp: () => null,
      props: comp.props.map((prop) => this.runtimeMappedPropToStyleProp(prop, ctx)),
    };
    this._componentStyles.add(comp.id, styleRegistry);

    return styleRegistry;
  }

  getSheetDeclStyles(compiled: RuntimeSheetDeclaration, ctx: TwinRuntimeContext): AnyStyle {
    const styledCtx = {
      rem: ctx.units.rem,
      deviceHeight: ctx.deviceHeight,
      deviceWidth: ctx.deviceWidth,
    };
    if (compiled._tag === 'COMPILED') {
      if (typeof compiled.value === 'string' || typeof compiled.value === 'number') {
        return { [compiled.prop]: parseCssValue(compiled.prop, `${compiled.value}`, styledCtx) };
      }
      if (Array.isArray(compiled.value)) {
        // TODO: fix deep concat
        return { [compiled.prop]: composeDeclValueArray(compiled.value) };
      }
      return compiled.value;
    }

    if (typeof compiled.value === 'string') {
      return { [compiled.prop]: parseCssValue(compiled.prop, compiled.value, styledCtx) };
    }
    if (typeof compiled.value === 'number') {
      if (compiled.isUnitLess) return { [compiled.prop]: compiled.value };
      return { [compiled.prop]: parseCssValue(compiled.prop, `${compiled.value}`, styledCtx) };
    }
    if (Array.isArray(compiled.value)) {
      const props: any[] = compiled.value.flatMap((decl) => {
        if (typeof decl.value !== 'string') return [];
        return asArray({ [decl.prop]: parseCssValue(decl.prop, decl.value, styledCtx) });
      });
      return { transform: props };
    }
    return compiled.value;
  }
}
