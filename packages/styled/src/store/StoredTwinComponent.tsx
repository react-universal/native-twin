import type { TwinRuntimeComponent } from "@native-twin/css/jsx";
import { type Atom, atom } from "@native-twin/helpers/react";
import { type ComponentStyleRegistry, TwinStyleSheet } from "./TwinStyledSheet";

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
  _sheet: ComponentStyleRegistry;
  private _parentSubscription: (() => void) | null = null;

  get interactionState() {
    return this._interactionState;
  }
  get id() {
    return this.twinComp.id;
  }
  get parentID() {
    return this.twinComp.parentID;
  }

  constructor(private twinComp: TwinRuntimeComponent) {
    this._interactionState = atom(getComponentInteractionState(twinComp));
    this._sheet = TwinStyleSheet.registerComponent(twinComp);
  }

  getPropStyles(prop: string, interaction = false) {
    const styles = TwinStyleSheet.getComponentStyles(
      this.id,
      prop,
      interaction
    );

    return styles;
  }

  getStyledProps(withPointer: boolean, withGroup: boolean) {
    return TwinStyleSheet.getComponentStyledProps(this.id, withPointer, withGroup);
    // const styledProps
    // return this._sheet.props.reduce((prev, current) => {
    //   return Object.assign(
    //     { ...prev },
    //     {
    //       [current.target]: TwinStyleSheet.getComponentStyles(
    //         this.twinComp.id,
    //         current.prop,
    //         false
    //       ),
    //     }
    //   );
    // }, {});
    // // const result: Record<string, unknown> = {};
    // // for (const prop in this._currentStyles) {
    // //   result[prop] = this._currentStyles[prop].get();
    // // }
    // // return result;
  }

  subscribeToParentInteractions(parent: StoredTwinComponent) {
    this.unmount();
    this._parentSubscription = parent._interactionState.subscribe((next) => {
      this._interactionState.set({
        interactions: {
          isGroupActive: next.interactions.isGroupActive,
          isLocalActive: next.interactions.isLocalActive,
        },
        meta: this.interactionState.get().meta,
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

const getComponentInteractionState = (
  twinComp: TwinRuntimeComponent
): ComponentState => ({
  meta: {
    hasGroupEvents: twinComp.metadata.hasGroupEvents,
    hasPointerEvents: twinComp.metadata.hasPointerEvents,
    isGroupParent: twinComp.metadata.isGroupParent,
  },
  interactions: {
    isGroupActive: false,
    isLocalActive: false,
  },
});
