import produce from 'immer';
import ComponentStyleSheet from '../sheets/ComponentStyleSheet';
import type {
  IStyleProp,
  TInteractionPseudoSelectors,
  TInternalStyledComponentProps,
} from '../types';
import type { IRegisterComponentArgs } from '../types/store.types';
import { createStore } from './generator';

export interface IUseStyleSheetsInput extends TInternalStyledComponentProps {
  classProps: Record<string, string>;
  inlineStyles?: IStyleProp;
}

interface IComponentStyleSheets {
  className: string;
  styles: ComponentStyleSheet;
}
export interface IComponent {
  id: string;
  interactionsState: Record<TInteractionPseudoSelectors, boolean>;
  appearanceState: Omit<TInternalStyledComponentProps, 'parentID'>;
  styleSheets: { [k: string]: IComponentStyleSheets };
}

interface Store {
  components: { [k: string]: IComponent };
  globalStyleSheet: { [k: string]: IStyleProp };
}

const globalStore = createStore<Store>({
  components: {},
  globalStyleSheet: {},
});

const registerComponent = (component: IRegisterComponentArgs & { id: string }) => {
  const styleSheets = Object.entries(component.classProps).reduce((prev, current) => {
    const [classProp, propClassName] = current;
    prev[classProp] = {
      className: propClassName,
      styles: new ComponentStyleSheet(propClassName),
    };
    return prev;
  }, {} as { [k: string]: IComponentStyleSheets });
  globalStore.setState(
    produce((draft) => {
      draft.components[component.id] = {
        id: component.id,
        styleSheets,
        appearanceState: {
          isFirstChild: component.isFirstChild,
          isLastChild: component.isLastChild,
          nthChild: component.nthChild,
        },
        interactionsState: {
          'group-hover': false,
          active: false,
          focus: false,
          hover: false,
        },
      };
    }),
  );
};

const unregisterComponent = (id: string) => {
  globalStore.setState(
    produce((draft) => {
      if (id in draft.components) {
        delete draft.components[id];
      }
    }),
  );
};

function setComponentInteractionState(
  componentID: string,
  interaction: TInteractionPseudoSelectors,
  value: boolean,
) {
  globalStore.setState(
    produce((draft) => {
      if (componentID in draft.components) {
        draft.components[componentID]!.interactionsState[interaction] = value;
      }
    }),
  );
}

// interface IRegisterComponentClassNamesArgs {
//   classNames: string;
//   componentID: string;
// }
// const registerComponentClassNames = (input: IRegisterComponentClassNamesArgs) => {
//   const currentSheets = globalStore.getState().globalStyleSheet;
//   if (!(input.componentID in currentSheets)) {
//     currentSheets[input.componentID] = css(input.classNames).JSS;
//   }
// };

export { globalStore, registerComponent, unregisterComponent, setComponentInteractionState };
