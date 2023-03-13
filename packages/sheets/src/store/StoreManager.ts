import { produce, enableMapSet } from 'immer';
import type {
  IRegisterComponentArgs,
  TInteractionPseudoSelectors,
} from '../types/store.types';
import ComponentNode from './ComponentNode';
import { createStore } from './generator';

enableMapSet();

const storeManager = createStore({
  components: new Map<string, ComponentNode>(),
  registerComponent(input: IRegisterComponentArgs) {
    let component: ComponentNode;
    component = new ComponentNode(input);
    storeManager.setState((prevState) => {
      return produce(prevState, (draft) => {
        draft.components.set(component.id, component);
      });
    });
    return component.id;
  },
  unregisterComponent(id: string) {
    storeManager.setState((prevState) => {
      return produce(prevState, (draft) => {
        draft.components.delete(id);
      });
    });
  },
  setInteractionState(
    target: ComponentNode,
    interaction: TInteractionPseudoSelectors,
    value: boolean,
  ) {
    storeManager.setState((prevState) => {
      const producer = produce(prevState, (draft) => {
        const component = draft.components.get(target.id);
        component?.setInteractionState(interaction, value);
        if (component?.isGroupParent) {
          const childs = findComponentChildIDs(target.id);
          childs.forEach((childID) => {
            const child = draft.components.get(childID);
            if (child?.hasGroupInteractions) {
              child?.setInteractionState('group-hover', value);
            }
          });
        }
      });
      return producer;
    });
  },
});

export default storeManager;

function findComponentChildIDs(parentID: string) {
  const childs = storeManager.getState().components.values();
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
