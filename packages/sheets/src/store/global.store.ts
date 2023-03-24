import produce from 'immer';
import ComponentStyleSheet from '../sheets/ComponentStyleSheet';
import type {
  IStyleProp,
  TInteractionPseudoSelectors,
  TInternalStyledComponentProps,
} from '../types';
import type { IRegisterComponentArgs } from '../types/store.types';
import { createComponentID } from '../utils/createComponentID';
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
  parentID: string;
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

const registerComponent = (component: IRegisterComponentArgs) => {
  const styleSheets = Object.entries(component.classProps).reduce((prev, current) => {
    const [classProp, propClassName] = current;
    prev[classProp] = {
      className: propClassName,
      styles: new ComponentStyleSheet(propClassName),
    };
    return prev;
  }, {} as { [k: string]: IComponentStyleSheets });
  const componentID = createComponentID() as string;
  globalStore.setState(
    produce((draft) => {
      draft.components[componentID] = {
        id: componentID,
        styleSheets,
        parentID: component.parentID,
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
  return componentID;
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

function findComponentChildIDs(parentID: string) {
  const childs = Object.values(globalStore.getState().components);
  const childsFound: string[] = [];
  for (const current of childs) {
    const currentMeta = getStyleSheetInteractions(current.styleSheets);
    if (current.parentID === parentID && currentMeta.hasGroupInteractions) {
      childsFound.push(current.id);
      const recursiveChilds = findComponentChildIDs(current.id);
      childsFound.push(...recursiveChilds);
    }
  }
  return childsFound;
}

function getStyleSheetInteractions(stylesheets: IComponent['styleSheets']) {
  let hasGroupInteractions = false;
  let hasPointerInteractions = false;
  let isGroupParent = false;
  for (const currentStyle of Object.values(stylesheets)) {
    if (currentStyle.styles.interactionStyles.length > 0) {
      hasPointerInteractions = true;
    }
    if (currentStyle.styles.classNameSet.has('group')) {
      isGroupParent = true;
    }
    if (currentStyle.styles.interactionStyles.some(([name]) => name.includes('group-'))) {
      hasGroupInteractions = true;
    }
  }
  return {
    hasGroupInteractions,
    hasPointerInteractions,
    isGroupParent,
  };
}

function setComponentInteractionState(
  componentID: string,
  interaction: TInteractionPseudoSelectors,
  value: boolean,
) {
  globalStore.setState(
    produce((draft) => {
      const component = draft.components[componentID];
      if (component) {
        component.interactionsState[interaction] = value;
        if (
          getStyleSheetInteractions(component.styleSheets as IComponent['styleSheets'])
            .isGroupParent
        ) {
          const childs = findComponentChildIDs(component.id);
          childs.forEach((currentChildID) => {
            const currentChild = draft.components[currentChildID];
            if (currentChild) {
              currentChild.interactionsState['group-hover'] = value;
            }
          });
        }
      }
    }),
  );
}

export { globalStore, registerComponent, unregisterComponent, setComponentInteractionState };
