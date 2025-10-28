import type { __Theme__, TwinRuntimeContext } from '@native-twin/core';
import { StyleSheetAdapter, sheetEntryToStyle } from '@native-twin/core';
import { getRuleSelectorGroup, getRuleSelectorGroups, type SheetEntry } from '@native-twin/css';
import { compileEntryDeclaration, type RuntimeSheetDeclaration } from '@native-twin/css/jsx';
import { asArray } from '@native-twin/helpers';
import { type Atom, atom } from '@native-twin/helpers/react';
import { StyleSheet as NativeSheet, Platform } from 'react-native';
import { styledContext } from '../store/observables/styles.obs';
import { INTERNAL_RESET } from '../utils/constants';
import { tw } from './native-tw';

export interface ComponentState {
  meta: {
    hasGroupEvents: boolean;
    hasPointerEvents: boolean;
    isGroupParent: boolean;
  };
  interactions: {
    isLocalActive: boolean;
    isGroupActive: boolean;
  };
}

export const componentsState: Map<string, Atom<ComponentState>> = new Map();

class JSXStyleSheet extends StyleSheetAdapter<__Theme__> {
  create = NativeSheet.create;
  absoluteFill = NativeSheet.absoluteFill;
  absoluteFillObject = NativeSheet.absoluteFillObject;
  compose = NativeSheet.compose;
  flatten = NativeSheet.flatten;
  hairlineWidth = NativeSheet.hairlineWidth;
  // componentStates = new Map<string, Atom<ComponentState>>();

  get twinFn() {
    return tw;
  }
  get runtimeContext(): TwinRuntimeContext {
    return styledContext.get();
  }

  [INTERNAL_RESET]() {}

  constructor(debug: boolean) {
    super(debug);
  }

  toNativeStyles(entries: SheetEntry[]) {
    return entries
      .map((x) =>
        sheetEntryToStyle(
          {
            className: x.className,
            groups: getRuleSelectorGroups(x.selectors),
            declarations: this.toRuntimeDecls(asArray(x)),
            group: getRuleSelectorGroup(x.selectors),
            important: x.important,
            inherited: false,
            precedence: x.precedence,
          },
          styledContext.get(),
        ),
      )
      .filter((x) => x !== null);
  }

  toRuntimeDecls(entries: SheetEntry[]): RuntimeSheetDeclaration[] {
    const config = this.twinFn.config;
    return entries
      .flatMap((entry) => entry.declarations)
      .map((decl) =>
        compileEntryDeclaration(decl, {
          baseRem: config.root.rem,
          platform: Platform.OS,
        }),
      );
  }

  // getComponentByID(id: string, templates: string[] = []) {
  //   const component = this.get(id) ?? getGenericComponent(id);

  //   const props = component.props.map(({ prop, entries, target }) => {
  //     const config = this.twinFn.config;
  //     const twinFn = this.twinFn;
  //     const composedEntries = templates
  //       .flatMap((x) => (x.prop === prop ? twinFn(x.value) : []))
  //       .map(
  //         (x): RuntimeJSXStyle => ({
  //           className: x.className,
  //           groups: getRuleSelectorGroups(x.selectors),
  //           declarations: x.declarations.map((decl) =>
  //             compileEntryDeclaration(decl, {
  //               baseRem: config.root.rem,
  //               platform: Platform.OS,
  //             }),
  //           ),
  //           group: getRuleSelectorGroup(x.selectors),
  //           important: x.important,
  //           inherited: false,
  //           precedence: x.precedence,
  //         }),
  //       );

  //     const finalEntries = [...entries, ...composedEntries].sort((a, b) =>
  //       SheetOrders.sortSheetEntries(a as any, b as any),
  //     );
  //     const declarations = {
  //       base: finalEntries.filter((x) => x.group === 'base').flatMap((x) => x.declarations),
  //       pointer: finalEntries.filter((x) => x.group === 'pointer').flatMap((x) => x.declarations),
  //       group: finalEntries.filter((x) => x.group === 'group').flatMap((x) => x.declarations),
  //     };

  //     return {
  //       prop,
  //       target,
  //       entries: finalEntries,
  //       declarations,
  //     };
  //   });

  //   return {
  //     id,
  //     props,
  //     metadata: component.metadata,
  //   };
  // }

  getComponentState(id: string) {
    const state = componentsState.get(id);
    if (state) return state;
    
    const twinCmp = this.getComponent(id);

    componentsState.set(
      id,
      atom({
        interactions: { isGroupActive: false, isLocalActive: false },
        meta: twinCmp?.metadata ?? {
          hasGroupEvents: false,
          hasPointerEvents: false,
          isGroupParent: false,
        },
      }),
    );
    return componentsState.get(id)!;
  }
}

export const StyleSheet = new JSXStyleSheet(true);
