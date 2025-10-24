import { sheetEntryToStyle, type TwinRuntimeContext } from "@native-twin/core";
import type { AnyStyle } from "@native-twin/css";
import type { TwinRuntimeComponent } from "@native-twin/css/jsx";
import { type Atom, atom } from "@native-twin/helpers/react";
import { type ComponentStyleRegistry, TwinStyleSheet } from "./TwinStyledSheet";

const EMPTY_STYLES = Object.freeze({});

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

export class StoredTwinComponent {
  private _interactionState: Atom<ComponentState>;
  private _currentStyles: {
    [prop: string]: Atom<AnyStyle>;
  };
  private _sheet: ComponentStyleRegistry;
  private _parentSubscription: (() => void) | null = null;

  get interactionState() {
    return this._interactionState.get();
  }

  constructor(
    private twinComp: TwinRuntimeComponent,
    private runtimeContext: TwinRuntimeContext
  ) {
    this._interactionState = atom({
      meta: {
        hasGroupEvents: this.twinComp.metadata.hasGroupEvents,
        hasPointerEvents: this.twinComp.metadata.hasPointerEvents,
        isGroupParent: this.twinComp.metadata.isGroupParent,
      },
      interactions: {
        isGroupActive: false,
        isLocalActive: false,
      },
    });
    const styles = this.twinComp.props.map((prop) => {
      const styles = prop.entries.flatMap(
        (x) => sheetEntryToStyle(x, this.runtimeContext) ?? []
      );
      return [prop.target, atom(TwinStyleSheet.flatten(styles))] as const;
    });
    this._currentStyles = Object.fromEntries(styles);
    this._sheet = TwinStyleSheet.registerComponent(twinComp);
  }

  getPropStyles(prop: string) {
    const style = this._currentStyles[prop];
    if (!style) return EMPTY_STYLES;

    return this._currentStyles[prop].get();
  }

  getStyledProps() {
    return this._sheet.props.reduce((prev, current) => {
      return Object.assign(
        { ...prev },
        {
          [current.target]: TwinStyleSheet.getComponentStyles(
            this.twinComp.id,
            current.prop,
            false
          ),
        }
      );
    }, {});
    // const result: Record<string, unknown> = {};
    // for (const prop in this._currentStyles) {
    //   result[prop] = this._currentStyles[prop].get();
    // }
    // return result;
  }

  subscribeToParentInteractions(parent: StoredTwinComponent) {
    this.unmount();
    this._parentSubscription = parent._interactionState.subscribe((next) => {
      this._interactionState.set({
        interactions: {
          isGroupActive: next.interactions.isGroupActive,
          isLocalActive: next.interactions.isLocalActive,
        },
        meta: this.interactionState.meta,
      });
    });
    return this._parentSubscription;
  }

  unmount() {
    if (this._parentSubscription) {
      this._parentSubscription();
      this._parentSubscription = null;
    }
  }
}
