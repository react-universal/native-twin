import produce, { enableMapSet } from 'immer';
import type { IStyleProp, StyledProps, TInteractionPseudoSelectors } from '../types';
import type { IRegisterComponentArgs } from '../types/store.types';
import ComponentNode from './ComponentNode';
import { createStore } from './generator';

enableMapSet();

export interface IUseStyleSheetsInput
  extends StyledProps<{
    classProps: Record<string, string>;
    inlineStyles?: IStyleProp;
  }> {}

interface Store {
  components: { [k: string]: ComponentNode };
  globalStyleSheet: { [k: string]: IStyleProp };
}

const globalStore = createStore<Store>({
  components: {},
  globalStyleSheet: {},
});

const registerComponent = (input: IRegisterComponentArgs) => {
  const component = new ComponentNode({
    classProps: input.classProps,
    inlineStyles: input.inlineStyles,
    isFirstChild: input.isFirstChild,
    isLastChild: input.isLastChild,
    nthChild: input.nthChild,
    parentID: input.parentID,
    className: input.className,
  });
  globalStore.setState(
    produce((draft) => {
      draft.components[component.id] = Object.assign(component);
    }),
  );
  return component.id;
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
    if (current.parentComponentID === parentID && current.hasGroupInteractions) {
      childsFound.push(current.id);
      const recursiveChilds = findComponentChildIDs(current.id);
      childsFound.push(...recursiveChilds);
    }
  }
  return childsFound;
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
        if (component.isGroupParent) {
          const childs = findComponentChildIDs(componentID);
          childs.forEach((childID) => {
            const child = draft.components[childID];
            if (child && child.hasGroupInteractions) {
              child.setInteractionState('group-hover', value);
            }
          });
        }
      }
    }),
  );
  // globalStore.setState(
  //   produce((draft) => {
  //     const component = draft.components[componentID];
  //     if (component) {
  //       component.interactionsState[interaction] = value;
  //       if (component.isGroupParent) {
  //         const childs = findComponentChildIDs(component.id);
  //         childs.forEach((currentChildID) => {
  //           const currentChild = draft.components[currentChildID];
  //           if (currentChild) {
  //             currentChild.interactionsState['group-hover'] = value;
  //           }
  //         });
  //       }
  //     }
  //   }),
  // );
}

export { globalStore, registerComponent, unregisterComponent, setComponentInteractionState };
